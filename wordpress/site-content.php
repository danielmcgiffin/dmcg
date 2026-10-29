<?php
/**
 * Plugin Name: Danny McGiffin — Site Content
 * Description: Source descriptions and historical URL redirects for the migrated site.
 */
add_action('wp_head', function () {
    if (!is_singular()) return;
    $description = get_post_meta(get_queried_object_id(), '_dmcg_description', true);
    if ($description) echo '<meta name="description" content="' . esc_attr($description) . '">' . "\n";
});
add_action('template_redirect', function () {
    $path = wp_parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    foreach (get_option('dmcg_source_redirects', []) as $redirect) {
        if (untrailingslashit($path) !== untrailingslashit($redirect['from'])) continue;
        $target = $redirect['to'];
        if (str_starts_with($target, 'https://dannymcgiffin.com/')) $target = substr($target, strlen('https://dannymcgiffin.com'));
        if (str_starts_with($target, '/') && !str_starts_with($target, '//')) {
            wp_safe_redirect(home_url($target), 301);
            exit;
        }
    }
}, 1); // Honor explicit legacy routes before WordPress canonical guessing.
