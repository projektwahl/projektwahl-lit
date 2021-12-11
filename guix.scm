(use-modules (guix)
             (guix build-system gnu)
             (guix licenses))

; https://news.ycombinator.com/item?id=19808225
; https://dustycloud.org/blog/javascript-packaging-dystopia/
; https://github.com/jellelicht/guix/pull/1
; https://www.mail-archive.com/guix-devel@gnu.org/msg48964.html
; https://git.ngyro.com/guix-npm

(package
  (name "hello")
  (version "2.10")
  (source (origin
            (method url-fetch)
            (uri (string-append "mirror://gnu/hello/hello-" version
                                ".tar.gz"))
            (sha256
             (base32
              "0ssi1wpaf7plaswqqjwigppsg5fyh99vdlb9kzl7c9lng89ndq1i"))))
  (build-system gnu-build-system)
  (synopsis "Hello, GNU world: An example GNU package")
  (description "Guess what GNU Hello prints!")
  (home-page "http://www.gnu.org/software/hello/")
  (license gpl3+))