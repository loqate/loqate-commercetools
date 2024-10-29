---
title: Setup Guide
layout: home
permalink: /docs/SetupGuide
parent: Home
---

# Setup Guide

## Prerequisites

- Node.js 18.16.0 or higher
- Yarn 1.22.19 or higher
- A commercetools project
- Commercetools Frontend Studio
- A Loqate API key

## Disclaimers

- This repository is meant to be used as a reference to integrate Loqate services into a commercetools B2C Frontend project.
- In order to do so, you will need to get the latest version of the commercetools B2C Frontend template and apply the changes described in the [Backend-for-Frontend Changes](#backend-for-frontend-changes) and [Frontend Changes](#frontend-changes) sections on top of your existing implementation.
- On the frontend, the visual appearance of this Loqate integration is meant to be relatively simple and independent so that it can be carried over to your own project with minimal effort.
- On the backend-for-frontend, the Loqate integration is implemented so that it can be carried over to your own project with minimal effort.

## Installation

1. Clone the repository
2. Run the standard Commercetools Frontend setup process as described in the [Commercetools Frontend development docs](https://docs.commercetools.com/frontend-development/cli)

## Project Configuration - Studio settings

Please refer to the [Studio Settings](StudioSettings.md) documentation for instructions on how to configure the project.

## Backend-for-Frontend Changes

### **1. LoqateController**

The `LoqateController` is a key component that interacts with the Loqate API to handle address capture, verification, and validation for email and phone numbers. It serves as the gateway for these services, ensuring they are integrated within the commercetools environment.

#### **Key Features:**

- **Loqate API Client:** The controller initializes the `LoqateApi` client, configured with project settings like API key, address quality threshold, and validation timeouts.
- **Address Management:** It provides methods for capturing, verifying, and validating addresses based on user input.
- **Email & Phone Validation:** The controller includes email and phone validation methods that ensure the correctness of these fields as per the rules defined in Loqate’s API.
- **IP-based Country Detection:** It also enables the retrieval of the user's country based on their IP address for better geolocation-based address suggestions.

### **Controller Functions Overview**

#### **1. `createLoqateApi(actionContext: ActionContext): LoqateApi`**

- **Description:** This function creates a `LoqateApi` client instance using the project configuration. The API key, address verification threshold, and other settings are passed to the client. This ensures that each API call is correctly authenticated and configured according to the commercetools project.
- **Use Case:** Called internally by the controller before making requests to the Loqate API.

#### **2. `getAddresses(request: Request, actionContext: ActionContext): Promise<Response>`**

- **Description:** This function handles address lookup requests. It takes user-provided details (like text, city, country) and returns address suggestions from the Loqate API. The result is a list of possible address matches based on the input.
- **Use Case:** Used during my account adding of new address or checkout forms to provide real-time address suggestions as the user types.
- **Parameters:**
  - `request`: Contains query parameters such as `id`, `address`, `countryIsoCode`, and `city`.
  - `actionContext`: Provides access to the current commercetools project configuration.
- **Response:** Returns a list of matching addresses in JSON format.

#### **3. `verifyAddress(request: Request, actionContext: ActionContext): Promise<Response>`**

- **Description:** Verifies the accuracy of a provided address by checking against Loqate’s address verification system. It validates fields such as country, postal code, and city.
- **Use Case:** Called when the user submits a form that requires verified address data, such as during checkout.
- **Parameters:**
  - `request`: Contains the address details (`country`, `postalCode`, `city`, and `address`) to be verified.
  - `actionContext`: Accesses the commercetools project configuration.
- **Response:** Returns whether the address is valid, questionable, or invalid.

#### **4. `getCountryByIp(request: Request, actionContext: ActionContext): Promise<Response>`**

- **Description:** Retrieves the country of the user based on their IP address, leveraging Loqate’s IP-to-country service. If the request does not directly provide the client IP, it attempts to extract it from the `x-forwarded-for` headers.
- **Use Case:** Used to pre-fill the country field in checkout or registration forms for a better user experience.
- **Parameters:**
  - `request`: Contains the client IP address or retrieves it from headers.
  - `actionContext`: Provides the commercetools project configuration.
- **Response:** Returns the country detected from the user’s IP address.

#### **5. `validateEmail(request: Request, actionContext: ActionContext): Promise<Response>`**

- **Description:** Validates an email address using Loqate's email validation service. It ensures that the email is correctly formatted and that it meets the required validation criteria.
- **Use Case:** Used to validate email addresses during registration, checkout, or other form submissions where email accuracy is essential.
- **Parameters:**
  - `request`: Contains the email address to be validated.
  - `actionContext`: Accesses project configuration for email validation settings.
- **Response:** Returns the validation status of the email (e.g., valid, invalid, or catch-all).

#### **6. `validatePhone(request: Request, actionContext: ActionContext): Promise<Response>`**

- **Description:** Validates a phone number provided by the user using Loqate’s phone validation service. It ensures the phone number format is correct and valid for the given country.
- **Use Case:** Typically used during checkout or registration to ensure that users provide valid contact numbers.
- **Parameters:**
  - `request`: Contains the phone number and the country code for validation.
  - `actionContext`: Provides project-specific settings for phone validation.
- **Response:** Returns the validation status of the phone number.

#### **7. `getSettings(request: Request, actionContext: ActionContext): Promise<Response>`**

- **Description:** Retrieves and returns the project settings related to the Loqate integration. These settings determine the behavior of address lookup, address verification, email validation, and phone validation features.
- **Use Case:** This function is used to get the current Loqate-related settings for specific use cases, such as checkout or account management.
- **Response:** Returns a JSON object containing the current configuration for Loqate in the project.

#### **8. `getRestrictedListedCountries(request: Request, actionContext: ActionContext): Promise<Response>`**

- **Description:** Fetches a list of countries that are restricted from using Loqate services in the current project. This can be used to prevent address capture or validation in specific regions.
- **Use Case:** Used in form validations to check if a user’s country is restricted before allowing further actions.
- **Response:** Returns a JSON object containing restricted countries.

### **LoqateApi Class Overview**

#### **Key Methods in `LoqateApi`**

- **`getAddresses()`**: Fetches address suggestions based on user input.
- **`verifyAddress()`**: Verifies the accuracy of a provided address.
- **`getCountryByIp()`**: Retrieves the user's country based on their IP address.
- **`validateEmail()`**: Validates the format and deliverability of an email address.
- **`validatePhone()`**: Validates the format and correctness of a phone number.

### **Utility Functions**

#### **`isValidAddress(matchScore, addressVerificationLevel, goodAddressMinimumMatchscore)`**

- **Description:** Checks if an address is valid based on its match score and verification level.
- **Use Case:** Used to determine if an address should be accepted as valid, questionable, or invalid.

#### **`extractDescription(description)`**

- **Description:** Extracts the postal code and city from an address description string.
- **Use Case:** Used internally to parse and normalize address data.

#### **`extractCountryIsoCode(id)`**

- **Description:** Extracts the country ISO code from an address ID string.
- **Use Case:** Helps to normalize address data.

## Frontend Changes

### 1. **[Loqate Context](packages/poc/frontend/helpers/contexts/loqate/loqateContext.tsx)**

The `LoqateContext` provides a centralized state management system for Loqate-related features such as address capture, address verification, email validation, and phone validation. It encapsulates multiple Loqate API integrations and makes them accessible to components throughout the application via React's context API.

**Key Responsibilities:**

- **Address Lookup:** Listens to user input and fetches address suggestions from the Loqate API, debouncing the requests to reduce unnecessary API calls. The context updates the suggested addresses list and allows the user to select an address.
- **Address Verification:** Verifies the address provided by the user using the Loqate API. It triggers validation when an address is manually entered or submitted. The context validates the address based on the Loqate response, ensuring its accuracy.
- **Email and Phone Validation:** Integrates email and phone number validation, with the ability to validate inputs using the corresponding Loqate APIs. Results are stored in the context for use across components like checkout or user account management.
- **IP-to-Country Mapping:** Automatically fills in the country based on the user's IP address, improving user experience and preventing invalid country selections.
    Here’s a detailed description of the exposed functions in the `LoqateContext`:

**Exposed Functions**

1. **`setLoqateAddress(value: LoqateAddress)`**
    - **Description:** Updates the current address stored in the context based on the user's input or address selection. It triggers address suggestions when the input changes and resets the address verification state if the address changes.
    - **Use Case:** Called whenever the user updates their address input, whether through manual input or selecting an address from the suggestions dropdown.
    - **Parameters:**
        - `value`: The updated address object containing fields like `text`, `city`, `countryIsoCode`, etc.
2. **`verifyAddress(loqateAddress: LoqateAddress): Promise<LoqateIsValidAddress>`**

    - **Description:** Verifies the provided address using the Loqate API to ensure it's valid. It returns a `LoqateIsValidAddress` object, indicating whether the address is valid or not.
    - **Use Case:** Used to validate addresses during adding of new address in my account or checkout processes where accurate address entry is critical.
    - **Parameters:**
        - `loqateAddress`: The address object that needs to be verified.
    - **Returns:** A promise resolving to an object with `isValid: true` or `false` depending on whether the address is valid.

3. **`validateEmail(): Promise<boolean | undefined>`**

    - **Description:** Validates the email address associated with the current Loqate address. If email validation is enabled in the Loqate settings, it sends the email to Loqate’s validation API and updates the context with the result.
    - **Use Case:** Triggered to validate an email when users input their email address in a form, commonly during registration or checkout.
    - **Returns:** A promise resolving to a boolean indicating whether the email is valid (`true`/`false`), or `undefined` if validation is not enabled.

4. **`validatePhone(): Promise<boolean | undefined>`**

    - **Description:** Validates the phone number provided in the `LoqateAddress` object using the Loqate API. If phone validation is enabled, it checks the number's format and correctness based on the country.
    - **Use Case:** Used to validate phone numbers during form submission (e.g., in checkout forms) to ensure that the provided number is valid.
    - **Returns:** A promise resolving to a boolean indicating whether the phone number is valid (`true`/`false`), or `undefined` if validation is not enabled.

5. **`setBypassAddressVerification(bypass: boolean)`**

    - **Description:** Sets a flag to bypass address verification. This is useful in scenarios where the user wants to skip the verification process or manually override an invalid address.
    - **Use Case:** Typically used when users manually input invalid or questionable addresses and opt to bypass automatic verification for any reason by.
    - **Parameters:**
        - `bypass`: A boolean value that, when set to `true`, bypasses address verification.

6. **`setLoqateSettings(loqateSettings: LoqateSettings)`**
    - **Description:** Updates the Loqate settings used for address lookup and validation, including enabling or disabling email, phone, and address validation features.
    - **Use Case:** Used to configure or reconfigure Loqate settings dynamically (e.g., different pages might require different settings).
    - **Parameters:**
        - `loqateSettings`: The settings object that dictates how Loqate functionality is used (e.g., enabling/disabling email or phone validation).

The context handles API calls using RxJS operators like `debounceTime`, `distinctUntilChanged`, and `switchMap` to manage user input efficiently and ensure smooth address verification and lookup processes.

### 2. **[Address Capture](packages/poc/frontend/components/loqate/address-capture/index.tsx)**

The `AddressCapture` component is responsible for capturing and suggesting addresses based on user input. It integrates seamlessly with the Loqate Context and allows for dynamic address suggestions and selection.

**Key Features:**

- **Input Field:** The component displays an input field where users can begin typing their address. As they type, the component fetches address suggestions from Loqate based on the user’s input.
- **Address Suggestions Dropdown:** While the input field is focused, the component shows a dropdown of suggested addresses. These suggestions come from the Loqate API, and users can click on any suggestion to populate the address fields automatically.
- **Manual and Auto Address Handling:** The component supports both manual entry and auto-selection of addresses. If a user selects an address from the dropdown, the address is treated as an auto-populated value, while manual entries bypass the suggestion feature.
- **Debouncing and API Efficiency:** To minimize API calls, user input is debounced, ensuring that requests are only sent after a specified delay in typing.
- **Handling Nested Addresses (Address Containers):** In cases where the address suggestion is a container (e.g., a boulevard that contains many addresses), the component displays an icon, allowing the user to recognize such cases and continue refining their search.

### 3. **[Restricted Countries](packages\poc\frontend\components\commercetools-ui\organisms\checkout\components\steps\sections\addresses\hooks\useRestrictedListedCountries.ts)**

This code defines a React custom hook called `useRestrictedCountries` that retrieves and manages the list of countries that are not restricted, filtering out any countries that are restricted based on an external API call to the `loqate/getRestrictedCountries` action via the `commercetools` SDK.

#### Key Elements

1. **State Management**:

    - `countries`: This state holds the list of available countries, which is initialized with a static list of all countries (`allCountries`).
    - `fetchingInProgress`: A boolean state to track if the fetching process is currently ongoing.
    - `successfullyFetched`: A boolean state indicating whether the fetching was successfully completed.

2. **API Integration**:

    - The `fetchRestrictedCountries` function asynchronously calls the `loqate/getRestrictedCountries` API action using the `commercetools SDK`. It expects a response containing restricted country codes.

3. **Logic for Filtering Restricted Countries**:

    - The API response provides a list of restricted countries.
    - The list of restricted countries is mapped and filtered to remove any invalid entries (i.e., missing or empty country codes).
    - The hook filters out the restricted countries from the full list (`allCountries`).

4. **Side Effects (useEffect)**:

    - On component mount, the hook triggers the API call to fetch restricted countries.
    - During this process, `fetchingInProgress` is set to `true` and `successfullyFetched` is updated based on whether the call succeeds or fails.
    - In case of an error, the hook logs the error and falls back to the default list of all countries.

5. **Observable and RxJS Integration**:
    - The code uses RxJS operators (`map`, `tap`, `catchError`) to handle the API call, map the response, and manage error handling.
    - The `subscribe` function applies the country filtering logic and updates the `countries` state accordingly.
