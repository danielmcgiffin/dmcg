import importlib.util
import json
import unittest
from pathlib import Path

script = Path(__file__).resolve().parents[1] / "scripts/sync-substack.py"
spec = importlib.util.spec_from_file_location("sync_substack", script)
sync = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync)


class SubstackSyncTests(unittest.TestCase):
    def test_new_feed_post_joins_existing_archive(self):
        feed = b"""<rss><channel>
          <link>https://dannymcgiffin.substack.com</link>
          <item><title>A new article</title>
          <link>https://dannymcgiffin.substack.com/p/a-new-article?utm_source=rss</link>
          <pubDate>Mon, 28 Sep 2026 16:00:00 GMT</pubDate></item>
        </channel></rss>"""
        older = {"title": "An older article", "publishedAt": "2026-09-18", "href": "https://dannymcgiffin.substack.com/p/older"}
        posts = sync.merge_posts([older], sync.parse_posts(feed))
        self.assertEqual([post["title"] for post in posts], ["A new article", "An older article"])
        self.assertEqual(posts[0]["href"], "https://dannymcgiffin.substack.com/p/a-new-article")

    def test_invalid_or_empty_feed_does_not_replace_archive(self):
        with self.assertRaises(ValueError):
            sync.parse_posts(b"<rss><channel><link>https://another.example</link></channel></rss>")
        with self.assertRaises(ValueError):
            sync.parse_posts(b"<rss><channel><link>https://dannymcgiffin.substack.com</link></channel></rss>")

    def test_archive_can_find_a_post_before_rss_lists_it(self):
        archive = json.dumps([{
            "title": "A new article", "post_date": "2026-09-28T16:00:34.556Z",
            "canonical_url": "https://dannymcgiffin.substack.com/p/a-new-article"
        }]).encode()
        self.assertEqual(sync.parse_archive(archive), [{
            "title": "A new article", "publishedAt": "2026-09-28",
            "href": "https://dannymcgiffin.substack.com/p/a-new-article"
        }])
        self.assertEqual(sync.parse_relay_archive(b"Title: \n\nMarkdown Content:\n" + archive), sync.parse_archive(archive))


if __name__ == "__main__":
    unittest.main()
