(use-modules (guix)
             (gnu packages web)
             (guix build-system gnu)
             (guix packages)
             (guix git-download)
             (gnu packages)
             (guix gexp)
             (guix build utils)
             (gnu packages base)
             (srfi srfi-1)
             (gnu packages package-management)
             (guix build-system node)
             ((guix licenses) #:prefix license:))

;; ~/Documents/guix/etc/indent-code.el guix.scm 

;; https://issues.guix.gnu.org/51838
;; https://debbugs.gnu.org/cgi/bugreport.cgi?bug=51838

;; guix pull --url=https://gitlab.com/philip1/guix-patches.git --commit=b8a23bcfb5c7bec045b0214f45a85f36ea282ad4 --profile=/tmp/guix.master --disable-authentication
;; guix pull --url=/home/moritz/Documents/guix --profile=/tmp/guix.master --disable-authentication
;; GUIX_PROFILE="/tmp/guix.master"
;; . "$GUIX_PROFILE/etc/profile"
;; guix build --verbosity=3 --file=/home/moritz/Documents/projektwahl-lit/guix.scm 

;; https://news.ycombinator.com/item?id=19808225
;; https://dustycloud.org/blog/javascript-packaging-dystopia/
;; https://github.com/jellelicht/guix/pull/1
;; https://www.mail-archive.com/guix-devel@gnu.org/msg48964.html
;; https://git.ngyro.com/guix-npm

;; https://guix.gnu.org/manual/en/html_node/G_002dExpressions.html
;; in G-Expressions quasiqote etc has different syntax (#~ #$ #$@)

;; guix package --verbosity=3 --install-from-file=guix.scm

(define-public lit-html
  (package
    (name "lit-html")
    (version "2.0.2")
    (source (origin
              (method git-fetch)
              (uri (git-reference
                    (url "https://github.com/lit/lit")
                    (commit (string-append "lit-html@" version))))
              (file-name (git-file-name name version))
              (sha256
               (base32
                "1hi9v08jaj8nyiansbk2yayv21ayya52as6q8viiri5avf8i3nlk"))))
    (build-system node-build-system)
    (arguments
     '(#:tests?
       #f ; would need additional dependencies
       #:absent-dependencies
       '("@types/trusted-types"
         "@esm-bundle/chai"
         "@types/mocha"
         "@types/web-ie11"
         "@web/test-runner-mocha"
         "@webcomponents/shadycss"
         "@webcomponents/template"
         "@webcomponents/webcomponentsjs"
         "chokidar-cli"
         "concurrently"
         "internal-scripts"
         "mocha"
         "rollup"
         "typescript")
       #:phases
       (modify-phases %standard-phases
         (add-after 'unpack 'change-directory
           (lambda _
             (chdir "packages/lit-html")))
         
         (replace 'build 
           (lambda* (#:key inputs #:allow-other-keys)
             (begin
               (let ((esbuild (string-append (assoc-ref inputs "esbuild")
                                             "/bin/esbuild")))
                 (apply invoke  
                        (cons esbuild (append (find-files "src" "\\.ts$")
                                              '("--platform=browser"
                                                "--outdir=src")))))))
           ))))
    (native-inputs
     `(("esbuild" ,esbuild)))
    (home-page "https://github.com/lit/lit")
    (synopsis "simple library for building fast, lightweight web components.")
    (description "Lit is a simple library for building fast, lightweight web components.")
    (license license:bsd-3)))

(define-public lit-reactive-element
  (package
    (name "lit-reactive-element")
    (version "1.0.2")
    (source (origin
              (method git-fetch)
              (uri (git-reference
                    (url "https://github.com/lit/lit")
                    (commit (string-append "@lit/reactive-element@" version))))
              (file-name (git-file-name name version))
              (sha256
               (base32
                "1hi9v08jaj8nyiansbk2yayv21ayya52as6q8viiri5avf8i3nlk"))))
    (build-system node-build-system)
    (arguments
     '(#:tests?
       #f ; would need additional dependencies
       #:absent-dependencies
       '("@babel/cli"
         "@babel/core"
         "@babel/plugin-proposal-class-properties"
         "@babel/plugin-proposal-decorators"
         "@babel/plugin-transform-typescript"
         "@esm-bundle/chai"
         "@types/chai"
         "@types/mocha"
         "@webcomponents/shadycss"
         "@webcomponents/template"
         "@webcomponents/webcomponentsjs"
         "chokidar-cli"
         "internal-scripts"
         "mocha"
         "rollup"
         "typescript")
       #:phases
       (modify-phases %standard-phases
         (add-after 'unpack 'change-directory
           (lambda _
             (chdir "packages/reactive-element")))
         
         (replace 'build 
           (lambda* (#:key inputs #:allow-other-keys)
             (begin
               (let ((esbuild (string-append (assoc-ref inputs "esbuild")
                                             "/bin/esbuild")))
                 (apply invoke  
                        (cons esbuild (append (find-files "src" "\\.ts$")
                                              '("--platform=browser"
                                                "--outdir=src")))))))
           ))))
    (native-inputs
     `(("esbuild" ,esbuild)))
    (home-page "https://github.com/lit/lit")
    (synopsis "simple library for building fast, lightweight web components.")
    (description "Lit is a simple library for building fast, lightweight web components.")
    (license license:bsd-3)))


(define-public lit-element
  (package
    (name "lit-element")
    (version "3.0.2")
    (source (origin
              (method git-fetch)
              (uri (git-reference
                    (url "https://github.com/lit/lit")
                    (commit (string-append "lit-element@" version))))
              (file-name (git-file-name name version))
              (sha256
               (base32
                "1hi9v08jaj8nyiansbk2yayv21ayya52as6q8viiri5avf8i3nlk"))))
    (build-system node-build-system)
    (arguments
     '(#:tests?
       #f ; would need additional dependencies
       #:absent-dependencies
       '("@esm-bundle/chai"
         "@types/chai"
         "@types/mocha"
         "@webcomponents/shadycss"
         "@webcomponents/template"
         "@webcomponents/webcomponentsjs"
         "chokidar-cli"
         "downlevel-dts"
         "internal-scripts"
         "mocha"
         "rollup"
         "tslib"
         "typescript")
       #:phases
       (modify-phases %standard-phases
         (add-after 'unpack 'change-directory
           (lambda _
             (chdir "packages/lit-element")))
         
         (replace 'build 
           (lambda* (#:key inputs #:allow-other-keys)
             (begin
               (let ((esbuild (string-append (assoc-ref inputs "esbuild")
                                             "/bin/esbuild")))
                 (apply invoke  
                        (cons esbuild (append (find-files "src" "\\.ts$")
                                              '("--platform=browser"
                                                "--outdir=src")))))))
           ))))
    (native-inputs
     `(("esbuild" ,esbuild)))
    (inputs
     `(("@lit/reactive-element" ,lit-reactive-element)
       ("lit-html" ,lit-html)))
    (home-page "https://github.com/lit/lit")
    (synopsis "simple library for building fast, lightweight web components.")
    (description "Lit is a simple library for building fast, lightweight web components.")
    (license license:bsd-3)))


(define-public lit
  (package
    (name "lit")
    (version "2.0.2")
    (source (origin
              (method git-fetch)
              (uri (git-reference
                    (url "https://github.com/lit/lit")
                    (commit (string-append "lit@" version))))
              (file-name (git-file-name name version))
              (sha256
               (base32
                "04vh8rnj45p4lxxzqk6z942vw19ns2q3mjgdy00pxnjc7ccnwf6j"))))
    (build-system node-build-system)
    (arguments
     '(#:tests?
       #f ; would need additional dependencies
       #:absent-dependencies
       '("@esm-bundle/chai"
         "@types/chai"
         "@types/mocha"
         "@webcomponents/shadycss"
         "@webcomponents/template"
         "@webcomponents/webcomponentsjs"
         "chokidar-cli"
         "downlevel-dts"
         "internal-scripts"
         "mocha"
         "rollup"
         "tslib"
         "typescript")
       #:phases
       (modify-phases %standard-phases
         (add-after 'unpack 'change-directory
           (lambda _
             (chdir "packages/lit")))
         
         (replace 'build 
           (lambda* (#:key inputs #:allow-other-keys)
             (begin
               (let ((esbuild (string-append (assoc-ref inputs "esbuild")
                                             "/bin/esbuild")))
                 (apply invoke  
                        (cons esbuild (append (find-files "src" "\\.ts$")
                                              '("--platform=browser"
                                                "--outdir=src")))))))
           ))))
    (native-inputs
     `(("esbuild" ,esbuild)))
    (inputs
     `(
       ("@lit/reactive-element" ,lit-reactive-element)
       ("lit-element" ,lit-element)
       ("lit-html" ,lit-html)))
    (home-page "https://github.com/lit/lit")
    (synopsis "simple library for building fast, lightweight web components.")
    (description "Lit is a simple library for building fast, lightweight web components.")
    (license license:bsd-3)))


(define-public lit-labs-motion
  (package
    (name "lit-labs-motion")
    (version "1.0.1")
    (source (origin
              (method git-fetch)
              (uri (git-reference
                    (url "https://github.com/lit/lit")
                    (commit (string-append "@lit-labs/motion@" version))))
              (file-name (git-file-name name version))
              (sha256
               (base32
                "1wyzkfzj58zhz667gyggcz3rj1mqdxg57iwi7apycmbxv3f1ynb9"))))
    (build-system node-build-system)
    (arguments
     '(#:tests?
       #f ; would need additional dependencies
       #:absent-dependencies
       '("@esm-bundle/chai"
         "@types/chai"
         "@types/mocha"
         "@types/trusted-types"
         "@web/test-runner-mocha"
         "@web/dev-server"
         "chokidar-cli"
         "concurrently"
         "internal-scripts"
         "mocha"
         "rollup"
         "typescript")
       #:phases
       (modify-phases %standard-phases
         (add-after 'unpack 'change-directory
           (lambda _
             (chdir "packages/labs/motion")))
         
         (replace 'build 
           (lambda* (#:key inputs #:allow-other-keys)
             (begin
               (let ((esbuild (string-append (assoc-ref inputs "esbuild")
                                             "/bin/esbuild")))
                 (apply invoke  
                        (cons esbuild (append (find-files "src" "\\.ts$")
                                              '("--platform=browser"
                                                "--outdir=src")))))))
           ))))
    (native-inputs
     `(("esbuild" ,esbuild)))
    (inputs
     `(
       ("lit" ,lit)))
    (home-page "https://github.com/lit/lit")
    (synopsis "simple library for building fast, lightweight web components.")
    (description "Lit is a simple library for building fast, lightweight web components.")
    (license license:bsd-3)))

(define-public lit-labs-ssr-client
  (package
    (name "lit-labs-ssr-client")
    (version "1.0.0")
    (source (origin
              (method git-fetch)
              (uri (git-reference
                    (url "https://github.com/lit/lit")
                    (commit (string-append "@lit-labs/ssr-client@" version))))
              (file-name (git-file-name name version))
              (sha256
               (base32
                "1fpxn8xqi2s1dzi3wl6yyp1krid62pbcna5gqmn8ismk91dvsg91"))))
    (build-system node-build-system)
    (arguments
     '(#:tests?
       #f ; would need additional dependencies
       #:absent-dependencies
       '("rollup"
         "typescript"
         "internal-scripts")
       #:phases
       (modify-phases %standard-phases
         (add-after 'unpack 'change-directory
           (lambda _
             (chdir "packages/labs/ssr-client")))
         
         (replace 'build 
           (lambda* (#:key inputs #:allow-other-keys)
             (begin
               (let ((esbuild (string-append (assoc-ref inputs "esbuild")
                                             "/bin/esbuild")))
                 (apply invoke  
                        (cons esbuild (append (find-files "src" "\\.ts$")
                                              '("--platform=browser"
                                                "--outdir=src")))))))
           ))))
    (native-inputs
     `(("esbuild" ,esbuild)))
    (inputs
     `(
       ("@lit/reactive-element" ,lit-reactive-element)
       ("lit" ,lit)
       ("lit-html" ,lit-html)))
    (home-page "https://github.com/lit/lit")
    (synopsis "simple library for building fast, lightweight web components.")
    (description "Lit is a simple library for building fast, lightweight web components.")
    (license license:bsd-3)))


(define-public lit-labs-ssr
  (package
    (name "lit-labs-ssr")
    (version "1.0.0")
    (source (origin
              (method git-fetch)
              (uri (git-reference
                    (url "https://github.com/lit/lit")
                    (commit "53e642868d2f06429dfd9bb33e89e2baa3b45b64"))) ; (string-append "@lit-labs/ssr@" version)
              (file-name (git-file-name name version))
              (sha256
               (base32
                "064p0vjmdqpnmx9yazym36ffvrlwj9qknq3wr8pyrjnxj5a5c6r0"))))
    (build-system node-build-system)
    (arguments
     '(#:tests?
       #f ; would need additional dependencies
       #:absent-dependencies
       '("node-fetch"
         "parse5"
         "resolve"
         ;; dev dependencies:
         "@koa/router"
         "@open-wc/testing-karma"
         "@open-wc/testing"
         "@types/chai"
         "@types/command-line-args"
         "@types/koa__router"
         "@types/koa-cors"
         "@types/koa-static"
         "@types/koa"
         "@types/mocha"
         "@types/node-fetch"
         "@types/node"
         "@types/parse5"
         "@types/resolve"
         "@web/test-runner"
         "@webcomponents/template-shadowroot"
         "chai"
         "command-line-args"
         "deepmerge"
         "koa-cors"
         "koa-node-resolve"
         "koa-static"
         "koa"
         "mocha"
         "typescript"
         "uvu")
       #:phases
       (modify-phases %standard-phases
         (add-after 'unpack 'change-directory
           (lambda _
             (chdir "packages/labs/ssr")))
         
         (replace 'build 
           (lambda* (#:key inputs #:allow-other-keys)
             (begin
               (let ((esbuild (string-append (assoc-ref inputs "esbuild")
                                             "/bin/esbuild")))
                 (apply invoke  
                        (cons esbuild (append (find-files "src" "\\.ts$")
                                              '("--platform=browser"
                                                "--outdir=src")))))))
           ))))
    (native-inputs
     `(("esbuild" ,esbuild)))
    (inputs
     `(
       ("@lit-labs/ssr-client" ,lit-labs-ssr-client)
       ("@lit/reactive-element" ,lit-reactive-element)
       ("lit-element" ,lit-element)
       ("lit" ,lit)
       ("lit-html" ,lit-html)))
    (home-page "https://github.com/lit/lit")
    (synopsis "simple library for building fast, lightweight web components.")
    (description "Lit is a simple library for building fast, lightweight web components.")
    (license license:bsd-3)))


(define-public lit-labs-task
  (package
    (name "lit-labs-task")
    (version "1.0.0")
    (source (origin
              (method git-fetch)
              (uri (git-reference
                    (url "https://github.com/lit/lit")
                    (commit (string-append "@lit-labs/task@" version))))
              (file-name (git-file-name name version))
              (sha256
               (base32
                "1fpxn8xqi2s1dzi3wl6yyp1krid62pbcna5gqmn8ismk91dvsg91"))))
    (build-system node-build-system)
    (arguments
     '(#:tests?
       #f ; would need additional dependencies
       #:absent-dependencies
       '("@esm-bundle/chai"
         "@types/chai"
         "@types/mocha"
         "@types/trusted-types"
         "@web/test-runner-mocha"
         "chokidar-cli"
         "concurrently"
         "mocha"
         "rollup"
         "typescript"
         "internal-scripts")
       #:phases
       (modify-phases %standard-phases
         (add-after 'unpack 'change-directory
           (lambda _
             (chdir "packages/labs/task")))
         
         (replace 'build 
           (lambda* (#:key inputs #:allow-other-keys)
             (begin
               (let ((esbuild (string-append (assoc-ref inputs "esbuild")
                                             "/bin/esbuild")))
                 (apply invoke  
                        (cons esbuild (append (find-files "src" "\\.ts$")
                                              '("--platform=browser"
                                                "--outdir=src")))))))
           ))))
    (native-inputs
     `(("esbuild" ,esbuild)))
    (inputs
     `(
       ("@lit/reactive-element" ,lit-reactive-element)))
    (home-page "https://github.com/lit/lit")
    (synopsis "simple library for building fast, lightweight web components.")
    (description "Lit is a simple library for building fast, lightweight web components.")
    (license license:bsd-3)))






(define-public js-cookie
  (package
    (name "js-cookie")
    (version "3.0.1")
    (source (origin
              (method git-fetch)
              (uri (git-reference
                    (url "https://github.com/js-cookie/js-cookie")
                    (commit (string-append "v" version))))
              (file-name (git-file-name name version))
              (sha256
               (base32
                "0kxxgvfzq4wpiy3hxym7amikphfwcndq282xz20krmgzfbm0fx0y"))))
    (build-system node-build-system)
    (arguments
     '(#:tests?
       #f ; would need additional dependencies
       #:absent-dependencies
       '("browserstack-runner"
         "eslint"
         "eslint-config-standard"
         "eslint-plugin-promise"
         "eslint-plugin-html"
         "eslint-plugin-markdown"
         "grunt"
         "grunt-compare-size"
         "grunt-contrib-connect"
         "grunt-contrib-nodeunit"
         "grunt-contrib-qunit"
         "grunt-contrib-watch"
         "grunt-exec"
         "gzip-js"
         "prettier"
         "qunit"
         "release-it"
         "rollup"
         "rollup-plugin-filesize"
         "rollup-plugin-license"
         "rollup-plugin-terser"
         "standard")
       #:phases
       (modify-phases %standard-phases
         (replace 'build 
           (lambda* (#:key inputs #:allow-other-keys)
             (begin
               (let ((esbuild (string-append (assoc-ref inputs "esbuild")
                                             "/bin/esbuild")))
                 (invoke esbuild "src/api.mjs" "--bundle" "--platform=browser"
                         "--outfile=dist/js.cookie.mjs"))))
           ))))
    (native-inputs
     `(("esbuild" ,esbuild)))
    (home-page "https://github.com/js-cookie/js-cookie")
    (synopsis "simple, lightweight JavaScript API for handling browser cookies")
    (description "A simple, lightweight JavaScript API for handling browser cookies.")
    (license license:expat)))

(define-public jose
  (package
    (name "jose")
    (version "4.3.7")
    (source (origin
              (method git-fetch)
              (uri (git-reference
                    (url "https://github.com/panva/jose")
                    (commit (string-append "v" version))))
              (file-name (git-file-name name version))
              (sha256
               (base32
                "0vz6s8f0izldfh5h40rwfdpn0s21nnwqqv36a0k4lcvai90m5khv"))
              (modules '((guix build utils)))
              (snippet '(delete-file-recursively "dist"))
              ))
    (build-system node-build-system)
    (arguments
     '(#:tests?
       #f ; would need additional dependencies
       #:absent-dependencies
       '("@types/node"
         "ava"
         "bowser"
         "c8"
         "esbuild"
         "glob"
         "got"
         "karma"
         "karma-browserstack-launcher"
         "karma-qunit"
         "karma-summary-reporter"
         "nock"
         "npm-run-all"
         "p-throttle"
         "patch-package"
         "prettier"
         "qunit"
         "rollup"
         "tar"
         "timekeeper"
         "typedoc"
         "typedoc-plugin-markdown"
         "typescript")
       #:phases
       (modify-phases %standard-phases
         (replace 'build 
           (lambda* (#:key inputs #:allow-other-keys)
             (begin
               (let ((esbuild (string-append (assoc-ref inputs "esbuild")
                                             "/bin/esbuild")))
                 (apply invoke  
                        (cons esbuild (append (find-files "src" "\\.ts$")
                                              '("--platform=browser"
                                                "--outdir=dist/browser"))))
                 (apply invoke  
                        (cons esbuild (append (find-files "src" "\\.ts$")
                                              '("--platform=node"
                                                "--outdir=dist/node/esm"))))
                 )))
           ))))
    (native-inputs
     `(("esbuild" ,esbuild)))
    (home-page "https://github.com/panva/jose")
    (synopsis "\"JSON Web Almost Everything\" - JWA, JWS, JWE, JWT, JWK, JWKS with no dependencies using runtime's native crypto in Node.js, Browser, Cloudflare Workers, Electron, and Deno")
    (description "\"JSON Web Almost Everything\" - JWA, JWS, JWE, JWT, JWK, JWKS with no dependencies using runtime's native crypto in Node.js, Browser, Cloudflare Workers, Electron, and Deno.")
    (license license:expat)))



(define-public object-hash
  (package
    (name "object-hash")
    (version "2.2.0")
    (source (origin
              (method git-fetch)
              (uri (git-reference
                    (url "https://github.com/puleos/object-hash")
                    (commit (string-append "v" version))))
              (file-name (git-file-name name version))
              (sha256
               (base32
                "11v3jxd7q7fxazbxywswlxjm1sgz51wzr2fm4qyh5ab25hk32ckh"))
              (modules '((guix build utils)))
              (snippet '(delete-file-recursively "dist"))
              ))
    (build-system node-build-system)
    (arguments
     '(#:tests?
       #f ; would need additional dependencies
       #:absent-dependencies
       '("browserify"
         "gulp"
         "gulp-browserify"
         "gulp-coveralls"
         "gulp-exec"
         "gulp-istanbul"
         "gulp-jshint"
         "gulp-mocha"
         "gulp-rename"
         "gulp-replace"
         "gulp-uglify"
         "jshint"
         "jshint-stylish"
         "karma"
         "karma-chrome-launcher"
         "karma-mocha"
         "mocha")
       #:phases
       (modify-phases %standard-phases
         (replace 'build 
           (lambda* (#:key inputs #:allow-other-keys)
             (begin
               (let ((esbuild (string-append (assoc-ref inputs "esbuild")
                                             "/bin/esbuild")))
                 (invoke esbuild "index.js" "--bundle" "--platform=node"
                         "--outfile=dist/object_hash.js")
                 )))
           ))))
    (native-inputs
     `(("esbuild" ,esbuild)))
    (home-page "https://github.com/puleos/object-hash")
    (synopsis "Generate hashes from javascript objects in node and the browser.")
    (description "Generate hashes from javascript objects in node and the browser.")
    (license license:expat)))


(define-public oidc-token-hash
  (package
    (name "oidc-token-hash")
    (version "5.0.1")
    (source (origin
              (method git-fetch)
              (uri (git-reference
                    (url "https://github.com/panva/oidc-token-hash")
                    (commit (string-append "v" version))))
              (file-name (git-file-name name version))
              (sha256
               (base32
                "1b0kpppahgv1nds9n9j3qczy4ijg2102gha5vmd97qi8rp13c011"))
              ))
    (build-system node-build-system)
    (arguments
     '(#:tests?
       #f ; would need additional dependencies
       #:absent-dependencies
       '("eslint"
         "eslint-config-airbnb-base"
         "eslint-plugin-import"
         "nyc")
       ))
    (home-page "https://github.com/panva/oidc-token-hash")
    (synopsis "Create and validate hashes pushed by OpenID Connect providers to ID Tokens.")
    (description "Create and validate hashes pushed by OpenID Connect providers to ID Tokens.")
    (license license:expat)))


(define-public yallist
  (package
    (name "yallist")
    (version "4.0.0")
    (source (origin
              (method git-fetch)
              (uri (git-reference
                    (url "https://github.com/isaacs/yallist")
                    (commit (string-append "v" version))))
              (file-name (git-file-name name version))
              (sha256
               (base32
                "0dx5wpvcgzwc56di99sjh75rd3208ddsgw7sggh37rj5bcn546i9"))
              ))
    (build-system node-build-system)
    (arguments
     '(#:tests?
       #f ; would need additional dependencies
       #:absent-dependencies
       '("tap")
       ))
    (home-page "https://github.com/isaacs/yallist")
    (synopsis "Yet Another Linked List")
    (description "Yet Another Linked List")
    (license license:isc)))

(define-public lru-cache
  (package
    (name "lru-cache")
    (version "6.0.0")
    (source (origin
              (method git-fetch)
              (uri (git-reference
                    (url "https://github.com/isaacs/node-lru-cache")
                    (commit (string-append "v" version))))
              (file-name (git-file-name name version))
              (sha256
               (base32
                "1ds6c7ay1343g8m1p25shi4sl9xmlc9skwfq03xyvg007mnr7bx1"))
              ))
    (build-system node-build-system)
    (arguments
     '(#:tests?
       #f ; would need additional dependencies
       #:absent-dependencies
       '("tap" "benchmark")
       ))
    (inputs
     `(
       ("yallist" ,yallist)))
    (home-page "https://github.com/isaacs/node-lru-cache")
    (synopsis "A cache object that deletes the least-recently-used items.")
    (description "A cache object that deletes the least-recently-used items.")
    (license license:isc)))







(define-public openid-client
  (package
    (name "openid-client")
    (version "5.1.0")
    (source (origin
              (method git-fetch)
              (uri (git-reference
                    (url "https://github.com/panva/node-openid-client")
                    (commit (string-append "v" version))))
              (file-name (git-file-name name version))
              (sha256
               (base32
                "1frphrngpqvc15dyqkrncw4ydadvyfd3107q6j7bn4ah339j5zi1"))
              (modules '((guix build utils)))))
    (build-system node-build-system)
    (arguments
     '(#:tests?
       #f ; would need additional dependencies
       #:absent-dependencies
       '("@types/node"
         "@types/passport"
         "base64url"
         "chai"
         "jose2"
         "mocha"
         "nock"
         "nyc"
         "prettier"
         "readable-mock-req"
         "sinon"
         "timekeeper")
       #:phases
       (modify-phases %standard-phases
         
         )))
    (inputs
     `(
       ("oidc-token-hash" ,oidc-token-hash)
       ("object-hash" ,object-hash)
       ("lru-cache" ,lru-cache)
       ("jose" ,jose)
       ))
    (home-page "https://github.com/panva/node-openid-client")
    (synopsis "OpenID Certified™ Relying Party (OpenID Connect/OAuth 2.0 Client) implementation for Node.js.")
    (description "OpenID Certified™ Relying Party (OpenID Connect/OAuth 2.0 Client) implementation for Node.js.")
    (license license:expat)))





(define-public postgres
  (package
    (name "postgres")
    (version "2.0.0-beta.11")
    (source (origin
              (method git-fetch)
              (uri (git-reference
                    (url "https://github.com/porsager/postgres")
                    (commit (string-append "v" version))))
              (file-name (git-file-name name version))
              (sha256
               (base32
                "0yzvg12csk4fjw7j5r0z3spymnq5cz36s702j6c9z4z37k8di3z1"))
              (modules '((guix build utils)))))
    (build-system node-build-system)
    (arguments
     '(#:tests?
       #f ; would need additional dependencies
       #:absent-dependencies
       '()
       #:phases
       (modify-phases %standard-phases
         
         )))
    (inputs
     `(
       
       ))
    (home-page "https://github.com/porsager/postgres")
    (synopsis "Postgres.js - The Fastest full featured PostgreSQL client for Node.js")
    (description "Postgres.js - The Fastest full featured PostgreSQL client for Node.js")
    (license license:expat)))



(define-public zod
  (package
    (name "zod")
    (version "3.11.6")
    (source (origin
              (method git-fetch)
              (uri (git-reference
                    (url "https://github.com/colinhacks/zod")
                    (commit (string-append "v" version))))
              (file-name (git-file-name name version))
              (sha256
               (base32
                "1jh1m0qj8rg91w3bfvsbfhhm81knnkslqqx5xjanzbyj7107j2sd"))
              (modules '((guix build utils)))
              (snippet '(substitute* "tsconfig.base.json"
                          (("\"es5\"") "\"es6\"")))
              ))
    (build-system node-build-system)
    (arguments
     '(#:tests?
       #f ; would need additional dependencies
       #:absent-dependencies
       '("@rollup/plugin-typescript"
         "@types/benchmark"
         "@types/jest"
         "@types/node"
         "@typescript-eslint/eslint-plugin"
         "@typescript-eslint/parser"
         "benchmark"
         "dependency-cruiser"
         "eslint"
         "eslint-config-prettier"
         "eslint-plugin-ban"
         "eslint-plugin-import"
         "eslint-plugin-simple-import-sort"
         "eslint-plugin-unused-imports"
         "husky"
         "jest"
         "lint-staged"
         "make-coverage-badge"
         "nodemon"
         "prettier"
         "rollup"
         "rollup-plugin-uglify"
         "ts-jest"
         "ts-node"
         "tslib"
         "typescript")
       #:phases
       (modify-phases %standard-phases
         (replace 'build 
           (lambda* (#:key inputs #:allow-other-keys)
             (begin
               (let ((esbuild (string-append (assoc-ref inputs "esbuild")
                                             "/bin/esbuild")))
                 (invoke esbuild "src/index.ts" "--bundle"
                         "--outfile=lib/index.mjs"))))
           
           )
         )))
    (native-inputs
     `(("esbuild" ,esbuild)))
    (inputs
     `(
       
       ))
    
    (home-page "https://github.com/colinhacks/zod")
    (synopsis "TypeScript-first schema validation with static type inference")
    (description "TypeScript-first schema validation with static type inference")
    (license license:expat)))



(define-public projektwahl-lit
  (package
    (name "projektwahl-lit")
    (version "0.1.0")
    (source 
              (origin
            (method url-fetch)
            (uri "file://.")
            (sha256
               (base32
                "11v3jxd7q7fxbzbxywswlxjm1sgz51wzr2fm4qyh5ab25hk32ckh"))
              (modules '((guix build utils)))
            (snippet '(delete-file-recursively "guix.scm"))
            
            ))
    (build-system node-build-system)
    (inputs
     `(
       ("jose" ,jose)
       ))
    (home-page "https://github.com/panva/node-openid-client")
    (synopsis "OpenID Certified™ Relying Party (OpenID Connect/OAuth 2.0 Client) implementation for Node.js.")
    (description "OpenID Certified™ Relying Party (OpenID Connect/OAuth 2.0 Client) implementation for Node.js.")
    (license license:agpl3)))

projektwahl-lit

;; https://git.savannah.gnu.org/cgit/guix.git/
;; https://git.savannah.gnu.org/gitweb/?p=guix.git&view=view+git+repository
