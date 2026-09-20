"""Static regression checks; run from any directory with Python's standard library."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import unittest

ROOT = Path(__file__).resolve().parents[1]
PAGES = [ROOT / 'index.html', *sorted((ROOT / 'blog').glob('*.html'))]


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.tags = []
        self.text = path.read_text(encoding='utf-8')
        self.feed(self.text)

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))


class SiteChecks(unittest.TestCase):
    def test_disclaimer_on_every_page(self):
        self.assertEqual(len(PAGES), 5)
        for path in PAGES:
            with self.subTest(page=path.name):
                page = Page(path)
                notices = [a for tag, a in page.tags if 'personal-notice' in a.get('class', '').split()]
                self.assertEqual(len(notices), 1)
                self.assertIn("non rappresentano né riflettono le opinioni o le posizioni dell'Autorità Nazionale Anticorruzione (ANAC)", page.text)

    def test_local_resources_exist_and_ids_unique(self):
        for path in PAGES:
            page = Page(path)
            ids = [a['id'] for _, a in page.tags if 'id' in a]
            self.assertEqual(len(ids), len(set(ids)), str(path))
            for _, attrs in page.tags:
                for attr in ('src', 'href'):
                    url = attrs.get(attr, '')
                    if not url.startswith('/') or url.startswith('//'):
                        continue
                    parsed = urlsplit(url)
                    target = ROOT / parsed.path.lstrip('/')
                    if target.is_dir():
                        target = target / 'index.html'
                    self.assertTrue(target.exists(), f'{path.name}: {url}')
                    if parsed.fragment and target.suffix == '.html':
                        target_ids = [a.get('id') for _, a in Page(target).tags]
                        self.assertIn(parsed.fragment, target_ids)

    def test_embeds_only_load_on_request(self):
        page = Page(ROOT / 'index.html')
        self.assertFalse(any(tag == 'iframe' for tag, _ in page.tags))
        buttons = [a for tag, a in page.tags if tag == 'button' and 'data-embed-url' in a]
        self.assertEqual(len(buttons), 4)
        self.assertEqual({a['data-embed-url'] for a in buttons}, {
            'https://www.linkedin.com/embed/feed/update/urn:li:share:7502415955562622976?collapsed=1',
            'https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7506651977590657024?collapsed=1',
            'https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7503817163301122048?collapsed=1',
            'https://www.linkedin.com/embed/feed/update/urn:li:share:7504076470827352064?collapsed=1',
        })
        for button in buttons:
            self.assertTrue(button['data-embed-title'])
            self.assertEqual(button['aria-expanded'], 'false')
            self.assertEqual(button['aria-describedby'], 'linkedin-privacy')

    def test_shared_styles_load_before_blog_rules(self):
        css = (ROOT / 'blog/blog.css').read_text(encoding='utf-8')
        self.assertTrue(css.startswith("@import url('/site-additions.css');"))


if __name__ == '__main__':
    unittest.main()
