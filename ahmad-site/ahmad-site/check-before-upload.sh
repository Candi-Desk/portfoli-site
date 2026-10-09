#!/bin/sh
# Run in this folder before uploading. It must print OK.
bad=0
grep -l "{{STREET_AND_NUMBER}}" *.html && { echo "Fill in your street address (impressum.html, datenschutz.html)"; bad=1; }
grep -q 'G-XXXXXXXXXX' assets/js/consent.js && echo "Note: GA4 ID not set, so analytics stays OFF (this is safe)."
[ -f assets/fonts/Archivo-Variable.woff2 ] || echo "Note: Archivo font file missing, the site uses a fallback font."
[ $bad -eq 0 ] && echo OK
