Visual editor upgrades + content-first homepage

1) Extract over D:\gtawiki, accept the replacements. Nothing inside content\guides is touched.
2) Restart dev:  Remove-Item -Recurse -Force .next ; npm run dev
No new npm packages.

NEW routes/files: app/page/[num]/page.tsx (homepage pages 2, 3 ...), lib/url.ts,
components/admin/LinkPopover.tsx, AlignMenu.tsx, components/seo/{FeaturedHero,FeedCard,Pagination,HomeCategoryBar,HomeSearchButton,HomeFeed}.tsx
