# Loqate Commercetools Composable Commerce Plugin

`loqate-commercetools-b2c-frontend` provides integration between the commercetools platform and the Loqate API.

- [Loqate Commercetools Composable Commerce Plugin](#loqate-commercetools-composable-commerce-plugin)
  - [Overview](#overview)
  - [Feature Overview](#feature-overview)
  - [Setup Guide](#setup-guide)
  - [Important Disclaimers](#important-disclaimers)


## Overview

This repository contains a commercetools plugin that integrates with the Loqate API to provide address capture, address verification, email validation, and phone validation features.

The plugin makes modifications in the following areas:

- Checkout
- My Account
- Registration

The modifications are applied in two areas:

- Backend-for-frontend (BFF) - Commercetools extensions - used to make the Loqate API calls and handle the responses.
- Frontend - React components - used to display the address capture, address verification, email validation, and phone validation features.

## Feature Overview

The following Loqate products are supported:

1. [Address Capture](./docs/FeatureOverview.md) - Suggests addresses based on user input.
2. [Address Verify](./docs/FeatureOverview.md) - Verifies address validity.
3. [Email Validation](./docs/FeatureOverview.md) - Validates email addresses.
4. [Phone Validation](./docs/FeatureOverview.md) - Validates phone numbers.

These features can be toggled on or off through project settings.

Please refer to the [Feature Overview](docs/FeatureOverview.md) page for more information on the supported features.

## Setup Guide

Please refer to the [Setup Guide](./docs/SetupGuide.md) for instructions on how to set up and configure the Loqate Commercetools Composable Commerce Plugin.

Please refer to the [Studio Settings](./docs/StudioSettings.md) for instructions on how to configure the Loqate Commercetools Composable Commerce Plugin in the Studio.

## Important Disclaimers

This repository demonstrates the integration of Loqate address capture, address verification, email validation, and phone validation features with commercetools. It is to be used as a reference implementation for your own integration - it is not intended to be used as is in a production environment. Please refer to the [Setup Guide](docs/SetupGuide.md) for instructions on the changes required to carry over the Loqate Commercetools integration into your own project.

It uses the [Commercetools Frontend B2C template](https://docs.commercetools.com/frontend-development/b2c-store-launchpad-overview) as a base, specifically the latest as of 3 June 2024.

This plugin:

- Does not aim to keep up with the latest changes in the commercetools frontend template, but rather to provide a reference implementation.
- Should not be cloned and used as is in a production environment. It is recommended to use it as a reference and adapt it to your own needs by copying the relevant parts of the code and applying them to the merchant's implementation.
- Does not aim to fix any bugs or issues in the commercetools frontend template. If you encounter any issues related with the B2C Frontend Template, please refer to the [commercetools documentation](https://docs.commercetools.com/).
- Is not responsible for any bugs or issues coming from the Commercetools B2C Frontend Template, nor any customizations made to it and does not aim to fix them. You should refer to the commercetools documentation for support for any issues related to the specific version of the commercetools B2C Frontend Template that you are using.
- Does not take an opinion of the flow you should support in your store - it applies changes to the out of the box checkout, my account and registration flows.
