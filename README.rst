frontend-app-admin-console
##########################

|license-badge| |status-badge| |ci-badge| |codecov-badge|

.. |license-badge| image:: https://img.shields.io/github/license/openedx/frontend-app-admin-console.svg
    :target: https://github.com/openedx/frontend-app-admin-console/blob/main/LICENSE
    :alt: License

.. |status-badge| image:: https://img.shields.io/badge/Status-Maintained-brightgreen

.. |ci-badge| image:: https://github.com/openedx/frontend-app-admin-console/actions/workflows/ci.yml/badge.svg
    :target: https://github.com/openedx/frontend-app-admin-console/actions/workflows/ci.yml
    :alt: Continuous Integration

.. |codecov-badge| image:: https://codecov.io/github/openedx/frontend-app-admin-console/coverage.svg?branch=main
    :target: https://codecov.io/github/openedx/frontend-app-admin-console?branch=main
    :alt: Codecov

Purpose
=======

The console aims to centralize platform-level settings and administrative tasks—including authorization (AuthZ) and, 
eventually, other key configurations—into a single, extensible UI. It reduces platform fragmentation and improves 
administrator efficiency.

Getting Started
===============

It is recomended to use it in a Tutor instalation, for adding the MFE follow the intruction in
`Tutor MFE plugin <https://github.com/overhangio/tutor-mfe?tab=readme-ov-file#mfe-management>`_.

Configuration
-------------
This repository works with `openedx-authz <https://github.com/openedx/openedx-authz>`_

Plugins
=======
This MFE can be customized using `Frontend Plugin Framework <https://github.com/openedx/frontend-plugin-framework>`_.

The parts of this MFE that can be customized in that manner are documented `here </src/plugin-slots>`_.


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

https://github.com/openedx/frontend-app-[PLACEHOLDER]/issues

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

.. _Backstage: https://open-edx-backstage.herokuapp.com/catalog/default/component/frontend-app-[PLACEHOLDER]

Reporting Security Issues
=========================

Please do not report security issues in public.  Email security@openedx.org instead.
