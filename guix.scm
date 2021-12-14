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
             (guix licenses))

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
    (license bsd-3)))

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
    (license bsd-3)))


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
    (license bsd-3)))


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
    (license bsd-3)))

lit
