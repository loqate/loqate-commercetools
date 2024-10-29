---
title: Feature Overview
layout: home
permalink: /docs/FeatureOverview
parent: Home
---

# Feature Overview

## Table of Contents

- [Feature Overview](#feature-overview)
  - [Table of Contents](#table-of-contents)
  - [Address Capture](#address-capture)
    - [IP to Country](#ip-to-country)
  - [Address Verify](#address-verify)
  - [Email Validation](#email-validation)
  - [Phone Validation](#phone-validation)

## Address Capture

| Link         | URL                                                                                                               |
|--------------|-------------------------------------------------------------------------------------------------------------------|
| API Docs     | [Loqate Address Capture API Documentation]( https://www.loqate.com/developers/api/Capture/Interactive/Find/1.1/ ) |
| Product Docs | [Loqate Address Capture Product Documentation](https://www.loqate.com/en-gb/address-capture/)                     |

The Address Capture feature suggests possible addresses based on user input.

The integration works as follows:

- Calls to the [Find](https://www.loqate.com/developers/api/Capture/Interactive/Find/1.1/) endpoint are made continuously until an address of type `Address` is found.
- If the type is `Container`, the system continues making calls to the Find endpoint.
- Once an address of type `Address` is found, the [Retrieve](https://www.loqate.com/developers/api/Capture/Interactive/Retrieve/1.2/) endpoint is called to capture the full address details.
  
### IP to Country

The IP to Country feature determines the user’s country based on their IP address. The country field is auto-populated with the result.

**Supported configuration options:**

- `LOQATE_IP_TO_COUNTRY_ENABLED` - Toggle for IP to country functionality on or off.
- `LOQATE_ADDRESS_LOOKUP_CHECKOUT` - Toggle for address lookup during checkout.
- `LOQATE_ADDRESS_LOOKUP_MY_ACCOUNT` - Toggle for address lookup on the "My Account" page.
- `CHECKOUT_ADDRESS_REQUEST_LIMIT` - Debounce time for address capture requests.
- `RESTRICTED_COUNTRIES` - List of restricted country ISO2 codes to exclude from address capture suggestions.

**Integration areas:**

- Checkout
- My Account

## Address Verify

| Link         | URL                                                                                                               |
|--------------|-------------------------------------------------------------------------------------------------------------------|
| API Docs     | [Loqate Address Verify API Documentation]( https://www.loqate.com/developers/apis/cleanse-api/international-batch-cleanse/ ) |
| Product Docs | [Loqate Address Verify Product Documentation](https://www.loqate.com/en-gb/address-validation/)                     |
| AVC        | [Loqate Address Verify Codes Documentation](https://support.loqate.com/documentaction/reportcodes/address-verification-code/) |

Address Verification evaluates the validity of the user-inputted address upon form submission. The system validates the address using fields like country, city, postal code, and street address. Based on Loqate's response, the address is scored as either `Good`, `Questionable`, or `Invalid` using the `Address Verification Code` provided by Loqate.

1. **Good Address** - No issues detected.
2. **Questionable Address** - The user is prompted to accept a corrected address suggested by Loqate. The user can either edit the address manually or proceed with the initial input.
3. **Invalid Address** - A suggestion is provided to update the address. The user can either update or proceed with the original input.

**Supported configuration options:**

- `LOQATE_ADDRESS_VERIFICATION_CHECKOUT` - Toggle for address verification during checkout.
- `LOQATE_ADDRESS_VERIFICATION_MY_ACCOUNT` - Toggle for address verification on the "My Account" page.
- `LOQATE_AVC` - Minimum matchscore threshold for an address to be considered `Good`.

**Integration areas:**

- Checkout
- My Account

## Email Validation

| Link         | URL                                                                                                               |
|--------------|-------------------------------------------------------------------------------------------------------------------|
| API Docs     | [Loqate Email Validation API Documentation]( https://www.loqate.com/developers/api/EmailValidation/Interactive/Validate/2/) |
| Product Docs | [Loqate Email Validation Product Documentation](https://www.loqate.com/en-gb/email-validation-software/)                     |

The Email Validation feature verifies the user’s email address during input. It ensures the format is correct and that the address is valid.

**Supported configuration options:**

- `LOQATE_EMAIL_VALIDATION_CHECKOUT` - Toggle for email validation during checkout.
- `LOQATE_EMAIL_VALIDATION_MY_ACCOUNT` - Toggle for email validation on the "My Account" page.
- `LOQATE_EMAIL_VALIDATION_REGISTRATION` - Toggle for email validation during registration.
- `LOQATE_EMAIL_VALIDATION_TIMEOUT_MILLISECONDS` - Timeout duration for email validation requests.
- `LOQATE_INCLUDE_VALID_CATCHALL_EMAILS` - Determines whether `Valid_CatchAll` email validation responses are considered valid. Visit Loqate's documentation for more information on `Valid_CatchAll` behavior.

**Integration areas:**

- Checkout
- My Account
- Registration

## Phone Validation

| Link         | URL                                                                                                               |
|--------------|-------------------------------------------------------------------------------------------------------------------|
| API Docs     | [Loqate Phone Validation API Documentation]( https://www.loqate.com/developers/api/PhoneNumberValidation/Interactive/Validate/2.2/) |
| Product Docs | [Loqate Phone Validation Product Documentation](https://www.loqate.com/en-gb/phone-validation/)                     |

Phone Validation checks the correctness of the user-inputted phone number. This ensures the number is properly formatted and valid.

**Supported configuration options:**

- `LOQATE_PHONE_VALIDATION_CHECKOUT` - Toggle for phone validation during checkout.
- `LOQATE_PHONE_VALIDATION_MY_ACCOUNT` - Toggle for phone validation on the "My Account" page.
- `LOQATE_PHONE_VALIDATION_REGISTRATION` - Toggle for phone validation during registration.
- `LOQATE_INCLUDE_MAYBE_PHONE_NUMBERS` - Determines whether the `Maybe` phone number validation state is treated as valid. Visit Loqate's documentation for more information on `Maybe` behavior.

**Integration areas:**

- Checkout
- My Account
- Registration
