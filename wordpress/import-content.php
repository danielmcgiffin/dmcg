<?php
/** Temporary, authenticated content-import endpoint; removed after each import. */
add_action('rest_api_init', function () {
    register_rest_route('dmcg-import/v1', '/content', [
        'methods' => 'POST',
        'permission_callback' => function () { return current_user_can('manage_options'); },
        'callback' => function (WP_REST_Request $request) {
            $data = $request->get_json_params();
            if (empty($data['pages']) || !is_array($data['pages'])) {
                return new WP_Error('invalid_content', 'No pages supplied.', ['status' => 400]);
            }
            $existing = [];
            foreach ($data['pages'] as $page) {
                $matches = get_posts(['post_type' => ['page','post'], 'post_status' => 'any', 'numberposts' => 1,
                    'meta_key' => '_dmcg_source_path', 'meta_value' => $page['route']]);
                if ($matches) {
                    $post = $matches[0];
                    $hash = get_post_meta($post->ID, '_dmcg_import_hash', true);
                    if ($hash && $hash !== hash('sha256', $post->post_content) && empty($data['replace'])) {
                        return new WP_Error('editor_changes', 'Editor changes found at ' . $page['route'] . '. Import stopped; back up and explicitly choose --replace to overwrite.', ['status' => 409]);
                    }
                    $existing[$page['route']] = $post->ID;
                } else {
                    $slug = trim($page['route'], '/');
                    if ($slug && get_page_by_path($slug)) {
                        return new WP_Error('page_collision', 'An unowned page already exists at ' . $page['route'], ['status' => 409]);
                    }
                }
            }
            // Preflight all editor-owned templates before changing anything.
            foreach (['header', 'footer', 'page-no-title', 'single'] as $slug) {
                $type = in_array($slug, ['page-no-title','single'], true) ? 'wp_template' : 'wp_template_part';
                $posts = get_posts(['post_type' => $type, 'post_status' => 'any', 'name' => $slug, 'numberposts' => 1,
                    'tax_query' => [['taxonomy' => 'wp_theme', 'field' => 'slug', 'terms' => 'ollie']]]);
                if ($posts && empty($data['replace'])) {
                    $hash = get_post_meta($posts[0]->ID, '_dmcg_import_hash', true);
                    if (!$hash || $hash !== hash('sha256', $posts[0]->post_content)) {
                        return new WP_Error('template_changes', 'Editor changes found in ' . $slug . '. Import stopped.', ['status' => 409]);
                    }
                }
            }
            usort($data['pages'], function ($a, $b) { return substr_count($a['route'], '/') <=> substr_count($b['route'], '/'); });
            $ids = []; $report = [];
            foreach ($data['pages'] as $page) {
                $segments = explode('/', trim($page['route'], '/'));
                $slug = $page['route'] === '/' ? 'home' : array_pop($segments);
                $parent_route = '/' . ($segments ? implode('/', $segments) . '/' : '');
                $type = $page['type'] ?? 'page';
                $stored = isset($existing[$page['route']]) ? get_post($existing[$page['route']]) : null;
                // Do not rewrite unrelated pages, articles, or their publication dates.
                if ($stored && $stored->post_type === $type && $stored->post_name === $slug &&
                    $stored->post_title === $page['title'] && $stored->post_content === $page['content'] &&
                    $stored->post_excerpt === $page['description']) {
                    $ids[$page['route']] = $stored->ID;
                    $report[] = ['id' => $stored->ID, 'route' => $page['route'], 'type' => $type];
                    continue;
                }
                $id = wp_insert_post(wp_slash([
                    'ID' => $existing[$page['route']] ?? 0,
                    'post_type' => $type, 'post_status' => 'publish', 'post_title' => $page['title'],
                    'post_name' => $slug, 'post_content' => $page['content'],
                    'post_parent' => $type === 'page' && $page['route'] !== '/' && $parent_route !== '/' ? ($ids[$parent_route] ?? 0) : 0,
                    'post_excerpt' => $page['description'],
                    'post_date' => $stored ? $stored->post_date : (!empty($page['date']) ? $page['date'] . ' 12:00:00' : current_time('mysql')),
                    'comment_status' => 'closed', 'ping_status' => 'closed',
                ]), true);
                if (is_wp_error($id)) return $id;
                update_post_meta($id, '_wp_page_template', $type === 'page' ? 'page-no-title' : 'default');
                if ($type === 'post') wp_set_post_terms($id, $page['tags'] ?? [], 'post_tag');
                update_post_meta($id, '_dmcg_source_path', $page['route']);
                update_post_meta($id, '_dmcg_description', $page['description']);
                update_post_meta($id, '_dmcg_import_hash', hash('sha256', get_post($id)->post_content));
                $ids[$page['route']] = $id;
                $report[] = ['id' => $id, 'route' => $page['route'], 'type' => $type];
            }
            foreach (['header' => $data['header'], 'footer' => $data['footer'], 'page-no-title' => $data['template'], 'single' => $data['template']] as $slug => $content) {
                $type = in_array($slug, ['page-no-title','single'], true) ? 'wp_template' : 'wp_template_part';
                $posts = get_posts(['post_type' => $type, 'post_status' => 'any', 'name' => $slug, 'numberposts' => 1,
                    'tax_query' => [['taxonomy' => 'wp_theme', 'field' => 'slug', 'terms' => 'ollie']]]);
                if ($posts && $posts[0]->post_content === $content) continue;
                $id = wp_insert_post(wp_slash(['ID' => $posts ? $posts[0]->ID : 0, 'post_type' => $type,
                    'post_status' => 'publish', 'post_name' => $slug, 'post_title' => ucwords(str_replace('-', ' ', $slug)), 'post_content' => $content]), true);
                if (is_wp_error($id)) return $id;
                wp_set_object_terms($id, 'ollie', 'wp_theme');
                if ($type === 'wp_template_part') wp_set_object_terms($id, $slug, 'wp_template_part_area');
                update_post_meta($id, '_dmcg_import_hash', hash('sha256', get_post($id)->post_content));
            }
            $global_id = WP_Theme_JSON_Resolver::get_user_global_styles_post_id();
            $previous_styles_hash = get_option('dmcg_styles_import_hash');
            $current_styles = get_post($global_id)->post_content;
            // Preserve any subsequent Site Editor style changes on routine reimport.
            if (!$previous_styles_hash || hash('sha256', $current_styles) === $previous_styles_hash || !empty($data['replace'])) {
                $styles = array_merge($data['globalStyles'], ['isGlobalStylesUserThemeJSON' => true]);
                if (json_decode($current_styles, true) !== $styles) {
                    wp_update_post(wp_slash(['ID' => $global_id, 'post_content' => wp_json_encode($styles)]));
                }
                update_option('dmcg_styles_import_hash', hash('sha256', get_post($global_id)->post_content));
            }
            foreach ($data['assets'] as $asset) {
                $file = WP_CONTENT_DIR . '/uploads/dmcg' . $asset;
                $old = get_posts(['post_type' => 'attachment', 'post_status' => 'inherit', 'numberposts' => 1,
                    'meta_key' => '_dmcg_source_asset', 'meta_value' => $asset]);
                if (!$old && file_exists($file)) {
                    $id = wp_insert_attachment(['post_mime_type' => wp_check_filetype($file)['type'],
                        'post_title' => $asset === '/headshot.jpg' ? 'Danny McGiffin' : 'Built that Way', 'post_status' => 'inherit'], $file);
                    update_post_meta($id, '_dmcg_source_asset', $asset);
                    update_post_meta($id, '_wp_attachment_image_alt', $asset === '/headshot.jpg' ? 'Danny McGiffin' : 'Built that Way by Danny McGiffin');
                    $size = getimagesize($file);
                    if ($size) wp_update_attachment_metadata($id, ['width' => $size[0], 'height' => $size[1], 'file' => 'dmcg' . $asset, 'sizes' => []]);
                }
            }
            update_option('show_on_front', 'page');
            update_option('page_on_front', $ids['/']);
            update_option('page_for_posts', 0);
            update_option('blogdescription', $data['siteDescription'] ?? 'Business & Technology Advisor');
            update_option('blog_public', 0);
            global $wp_rewrite;
            $wp_rewrite->set_permalink_structure('/writing/%postname%/');
            $wp_rewrite->init();
            update_option('dmcg_source_redirects', $data['redirects'] ?? []);
            foreach (get_posts(['post_type' => ['post','page'], 'post_status' => 'publish', 'numberposts' => -1]) as $post) {
                if (!get_post_meta($post->ID, '_dmcg_source_path', true) &&
                    (($post->post_title === 'Hello world!' && str_contains($post->post_content, 'Welcome to WordPress')) ||
                     ($post->post_title === 'Sample Page' && str_contains($post->post_content, 'This is an example page')))) wp_trash_post($post->ID);
            }
            flush_rewrite_rules(false);
            wp_cache_flush();
            foreach ($report as &$record) $record['url'] = get_permalink($record['id']);
            return ['pages' => $report, 'theme' => get_stylesheet(), 'front_page' => $ids['/'], 'media' => count($data['assets'])];
        },
    ]);
});
