frontend-app-admin-console
##########################

|license-badge| |status-badge| |ci-badge| |codecov-badge|

.. |license-badge| image:: https://img.shields.io/github/license/openedx/frontend-app-admin-console.svg
    :target: https://github.com/openedx/frontend-app-admin-console/blob/master/LICENSE
    :alt: License

.. |status-badge| image:: https://img.shields.io/badge/Status-Maintained-brightgreen

.. |ci-badge| image:: https://github.com/openedx/frontend-app-admin-console/actions/workflows/ci.yml/badge.svg
    :target: https://github.com/openedx/frontend-app-admin-console/actions/workflows/ci.yml
    :alt: Continuous Integration

.. |codecov-badge| image:: https://codecov.io/github/openedx/frontend-app-admin-console/coverage.svg?branch=master
    :target: https://codecov.io/github/openedx/frontend-app-admin-console?branch=master
    :alt: Codecov

Purpose
=======

The console aims to centralize platform-level settings and administrative tasks—including authorization (AuthZ) and,
eventually, other key configurations—into a single, extensible UI. It reduces platform fragmentation and improves
administrator efficiency.

Branches and Releases
=====================

This app is published to NPM by ``semantic-release``, and its branches
follow `OEP-10 ADR 0002`_:

``master``
  Unstable.  Every merge publishes a prerelease on the ``alpha``
  dist-tag.  Breaking changes land here with no DEPR process and no
  warning, so it is not supported in production.  All changes, including
  bug fixes, should target this branch first.

``stable``
  Carries the newest stable major and owns the ``latest`` dist-tag.
  Changes arrive here as backports from ``master``, and no breaking
  change lands after publication.

``n.x`` and ``n.m.x``
  Maintenance branches for majors and minors that ``stable`` has moved
  past.  Each owns the dist-tag matching its own name, so consumers
  select a maintained line by semver range, e.g. ``"1.x"``.

``stable`` has not been cut yet: until this app is first ready for
production use, ``master`` and its alphas are all there is.  Both
``.releaserc`` and the ``Release CI`` workflow already know the whole
layout, including the maintenance branch patterns, so a new line starts
publishing as soon as it is pushed.

This repository is no longer branched or tagged for Open edX releases in
its own right.  It participates by published version instead, per
`OEP-10 ADR 0003`_.

The micro-frontend this app replaces goes on living on `legacy-mfe`_,
which is where any further ``release/RELEASENAME`` branches for it are
cut, for as long as a supported release still ships it.  Ulmo and
Verawood both do.

.. _OEP-10 ADR 0002: https://docs.openedx.org/projects/openedx-proposals/en/latest/processes/oep-0010/decisions/0002-frontend-stable-branches.html
.. _OEP-10 ADR 0003: https://docs.openedx.org/projects/openedx-proposals/en/latest/processes/oep-0010/decisions/0003-frontend-release-strategy.html
.. _legacy-mfe: https://github.com/openedx/frontend-app-admin-console/tree/legacy-mfe

Getting Started
===============

A running Open edX instance is needed to serve this app's backend APIs.
`Tutor`_ in development mode is the usual choice, and
``site.config.dev.tsx`` already points at its default hostnames.

Unlike a micro-frontend, this app is neither built nor served by
``tutor-mfe``.  Install dependencies with ``npm ci`` (using the Node
version in ``.nvmrc``), then start the dev server on the host with
``npm run dev``; it serves the app at
`http://apps.local.openedx.io:2025/admin-console <http://apps.local.openedx.io:2025/admin-console>`_.

.. _Tutor: https://github.com/overhangio/tutor

Configuration
-------------
This repository works with `openedx-authz <https://github.com/openedx/openedx-authz>`_

Plugins
=======
This frontend app can be customized using the `<Slot />` component from `frontend-base <https://github.com/openedx/frontend-base>`_. See the `slot naming and lifecycle ADR <https://github.com/openedx/frontend-base/blob/main/docs/decisions/0009-slot-naming-and-lifecycle.rst>`_ for the slot API and conventions.

The parts of this frontend app that can be customized in that manner are documented `here </src/slots>`_.


Development Roadmap
===================

* `Technical Approach: Console MVP (AuthZ-Scoped, Ulmo Release) <https://openedx.atlassian.net/wiki/x/M4B4MgE>`_.
* `Administrative Console Long-Term Technical Approach <https://openedx.atlassian.net/wiki/x/AgAwMQE>`_.

Getting Help
============

If you're having trouble, we have discussion forums at
https://discuss.openedx.org where you can connect with others in the community.

Our real-time conversations are on Slack. You can request a `Slack
invitation`_, then join our `community Slack workspace`_.  Because this is a
frontend repository, the best place to discuss it would be in the `#wg-frontend
channel`_.

For anything non-trivial, the best path is to open an issue in this repository
with as many details about the issue you are facing as you can provide.

https://github.com/openedx/frontend-app-admin-console/issues

For more information about these options, see the `Getting Help`_ page.

.. _Slack invitation: https://openedx.org/slack
.. _community Slack workspace: https://openedx.slack.com/
.. _#wg-frontend channel: https://openedx.slack.com/archives/C04BM6YC7A6
.. _Getting Help: https://openedx.org/getting-help

License
=======

The code in this repository is licensed under the AGPLv3 unless otherwise
noted.

Please see `LICENSE <LICENSE>`_ for details.

Contributing
============

Contributions are very welcome.  Please read `How To Contribute`_ for details.

.. _How To Contribute: https://openedx.org/r/how-to-contribute

This project is currently accepting all types of contributions, bug fixes,
security fixes, maintenance work, or new features.  However, please make sure
to have a discussion about your new feature idea with the maintainers prior to
beginning development to maximize the chances of your change being accepted.
You can start a conversation by creating a new issue on this repo summarizing
your idea.

The Open edX Code of Conduct
============================

All community members are expected to follow the `Open edX Code of Conduct`_.

.. _Open edX Code of Conduct: https://openedx.org/code-of-conduct/

People
======

The assigned maintainers for this component and other project details may be
found in `Backstage`_. Backstage pulls this data from the ``catalog-info.yaml``
file in this repo.

.. _Backstage: https://open-edx-backstage.herokuapp.com/catalog/default/component/frontend-app-admin-console

Reporting Security Issues
=========================

Please do not report security issues in public.  Email security@openedx.org instead.
