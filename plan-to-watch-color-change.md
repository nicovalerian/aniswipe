# Plan to Change "Plan to Watch" Badge Color

This document outlines the plan to change the color of the "Plan to Watch" status badge to a bluish color.

## 1. Modify the Import Page

The `variant` prop for the "Plan To Watch" status in `app/import-mal/page.tsx` will be changed from `"secondary"` to `"plan_to_watch"`.

This will be the change in `app/import-mal/page.tsx`:

```diff
--- a/app/import-mal/page.tsx
+++ b/app/import-mal/page.tsx
@@ -164,7 +164,7 @@
  case "completed":
  return "outline";
  case "plan_to_watch":
- return "secondary";
+ return "plan_to_watch";
  case "dropped":
  return "destructive";
  case "watching":

```

## 2. Review and Confirm

The change will be presented for confirmation before implementation.