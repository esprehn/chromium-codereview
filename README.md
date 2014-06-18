chromium-codereview
===================

A chrome extension that changes the frontend to Rietveld for Chromium making it awesome.

Getting started
-------------
1. Install [bower](http://bower.io/)
2. Run bower install in the root of the project.
3. Open about:flags and enable "Experimental web platform features".
4. Open chrome:://extensions and load the unpacked extension.

Note: Chrome 36+ is required.

The application works by redirecting navigations to codereview.chromium.org to /static/app/
which the server will respond to with a 404. It then replaces the 404 page with the app.
This is done since most rietveld pages take a long time to load, but the 404 page is fast.
