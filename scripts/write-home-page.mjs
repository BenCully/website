import { copyFileSync } from "node:fs"

// CloudFront uses the S3 REST origin, so /home is the object key "home",
// not home/index.html. The page is the same document as /.
copyFileSync("dist/index.html", "dist/home")
