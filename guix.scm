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

;; https://issues.guix.gnu.org/51838#66
;; [PATCH v3 06/43]
;; https://debbugs.gnu.org/cgi/bugreport.cgi?bug=51838

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
       '("@types/trusted-types")
       #:phases
       (modify-phases %standard-phases
         ;; The default configure phase fails due to various packages
         ;; being missing, as we don't have them packaged yet.
         (delete 'configure)
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

lit-html
