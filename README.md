chromium-codereview
===================

A chrome extension that changes the frontend to Rietveld for Chromium making it awesome.

Getting started
-------------
1. Install bower
2. Run bower install in the root of the project.
4. Open about:flags and enable "Experimental web platform features" and "Experimental JavaScript".
5. **Make sure that native imports are disabled**, see http://crbug.com/350530
3. Open chrome:://extensions and load the unpacked extension.

The application works by redirecting navigations to codereview.chromium.org to /app/ which
the server will respond to with a 404. It then replaces the 404 page with the app. This
is done since most rietveld pages take a long time to load, but the 404 page is fast.

UX Design language
-------------

Vertical spacing is in units of 0.25em, so acceptable margin and padding values are 0.25em,
0.5em, 1em etc. Favor 0.5em when in doubt.

Horizontal spacing is in units of 16px. You can also use 8px if needed, but 16px is probably
what you want.

Your components should include common.css to get the right link and buttons styles.
