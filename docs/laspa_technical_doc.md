# LASPA THIRD PARTY INTEGRATION TECHNICAL DOCUMENTATION

## Table of Contents

1. [INTRODUCTION](#1-introduction)
2. [DESCRIPTION](#2-description)
   - 2.1. [Customer Registration API](#21-customer-registration)
   - 2.2. [Ticket Purchase API](#22-ticket-purchase)
   - 2.3. [Ticket Expiration API](#23-ticket-expiration)
   - 2.4. [Ticket Verification API](#24-ticket-verification)
   - 2.5. [Violations Get API](#25-violations-get-api)
   - 2.6. [Violations Update API](#26-violations-update-api)
   - 2.7. [Clamp Request API](#27-clamp-request-api)
   - 2.8. [Clamp Request (UPDATE) API](#28-clamp-request-update-api)
   - 2.9. [Tow Request API](#29-tow-request-api)
   - 2.10. [Tow Request (UPDATE) API](#210-tow-request-update-api)
   - 2.11. [Impounded Vehicle Management API](#211-impounded-vehicle-api)
   - 2.12. [Impounded Vehicle (Query) API](#212-impounded-vehicle-query-api)
   - 2.13. [Fines and Appeal Management API](#213-fine-and-appeal-management-api-tbd)
3. [SMS Parking API](#3-sms-parking-api)
   - 3.1. [Get Parking Zones API](#31-get-parking-zones-api)
   - 3.2. [Get Parking Bays API](#32-get-parking-bays-api)
   - 3.3. [Parking Slot Initiation API](#33-parking-slot-initiation-api)
   - 3.4. [Parking Slot Confirmation API](#34-parking-slot-confirmation-api)
   - 3.5. [Get Customer Parking Receipt API](#35-get-customer-parking-receipt-api)

---

## 1. INTRODUCTION

The integration document aims to enable the management and processing of parking transactions, ticket verification, outstanding violations, and notifications to ensure proper enforcement. Any other needed APIs will be communicated.

---

## 2. DESCRIPTION

The solution consists of the following:

### 2.1 Customer Registration

This is a REST API to be provided by ICELL, designed to receive notifications about customer registration.

**Request:**
```json
{
  "customerReferenceId": "fb6074c1-509f-439e-9fd5-d08d3cb7fba9",
  "firstName": "Ayo",
  "lastName": "Taiwo",
  "email": "ayotaiwo@yahoo.com",
  "phoneNumber": "09099228833",
  "plateNumber": [
    {
      "plateCode": "GHF",
      "plateNumber": "736",
      "plateType": "Private",
      "plateSource": "Lagos"
    }
  ]
}
```

---

### 2.2 Ticket Purchase

This is a REST API to be provided by ICELL, designed to receive customer ticket purchase.

**Request:**
```json
{
  "customerReferenceId": "fefe3484-1866-4185c-9534-a7ca86h0d56760",
  "customerName": "Oluleke Odunuga",
  "customerEmail": "Odunugada@gmail.com",
  "zone": "Ikeja",
  "parkingBay": "Sansegbon Park",
  "parkingSpot": "Lane 2",
  "amount": 1000.00,
  "dateCreated": "2024-12-19 10:48:44",
  "trnxRef": "121914844142",
  "parkingStatus": 1,
  "parkingHour": 3,
  "parkingTime": "2024-12-19 10:48:44",
  "expiringTime": "2024-12-19 13:48:44",
  "checkoutTime": null,
  "parkingPrice": 1000.00,
  "plateNumber": {
    "plateSource": "Lagos",
    "plateCode": "KJA",
    "plateType": "Private",
    "plateNumber": " 986HH"
  }
}
```

---

### 2.3 Ticket Expiration

This is a REST API to be provided by ICELL, designed to receive notifications about ticket expirations for customers whose parking has expired.

**Request:**
```json
{
  "parkingReferenceId": "string",
  "PlateNumber": {
    "PlateSource": "Lagos",
    "PlateCode": "KJA",
    "PlateType": "Private",
    "PlateNumber": " 986HH"
  },
  "parkingZoneId": "string",
  "parkingBayId": "string"
}
```

**Response:**
```json
{
  "status": true,
  "message": "Acknowledge"
}
```

---

### 2.4: Ticket Verification

This is a REST API provided by Automata, intended for ICELL to use in verifying parking vehicle plate numbers to retrieve information about parking status and outstanding violations.

**Request:**
```json
{
  "plateSource": "string",
  "plateCode": "string",
  "plateType": "string",
  "plateNumber": "string"
}
```

**Response:**
```json
{
  "status": true,
  "statusMessage": "Retrieved successfully",
  "statusCode": 200,
  "data": {
    "parkingStatus": true,
    "customerParkingDetails": {
      "parkingID": 21,
      "zone": "Ikeja",
      "customerName": "Oluleke Odunuga",
      "parkingBay": "Sansegbon Park",
      "parkingSpot": "Lane 2",
      "amount": 1000.00,
      "dateCreated": "2024-12-19 10:48:44",
      "trnxRef": "121914844142",
      "customerEmail": "Odunugada@gmail.com",
      "parkingstatus": 1,
      "parkingHour": 3,
      "parkingTime": "2024-12-19 10:48:44",
      "expiringTime": "2024-12-19 13:48:44",
      "checkoutTime": null,
      "parkingAgentName": "Sola Kayode",
      "enforcerName": "Seun Pereira",
      "parkingPrice": 500.00,
      "plateNumber": {
        "plateSource": "Lagos",
        "plateCode": "KJA",
        "plateType": "Private",
        "plateNumber": " 986HH"
      }
    },
    "outStandingViolations": {
      "totalViolationFee": 20000,
      "customerOutStandingViolations": [
        {
          "plateNumber": "AAS123EE11",
          "violation": " PARKING ACROSS YELLOW LINE ON PUBLIC HIGHWAY / ILLEGAL PARKING",
          "violationZone": "Ikeja",
          "violationBay": "Sansegbon Park",
          "violationDate": "Sat Aug 17 2024 07:51:49 PM",
          "violationFee": 20000
        }
      ]
    }
  }
}
```

---

### 2.5: Violations GET API

This is a REST API provided by Automata, to enable ICELL retrieve all parking violations.

**Request:** `GET`

**Response:**
```json
{
  "status": true,
  "statusMessage": "Data Retrieved successfully",
  "statusCode": 200,
  "data": [
    {
      "violationId": 1,
      "violationType": "PARKING ACROSS YELLOW LINE ON PUBLIC HIGHWAY / ILLEGAL PARKING",
      "violationFee": 20000,
      "violationCode": "PV01"
    },
    {
      "violationId": 2,
      "violationType": "PARKING IN A HANDICAP DESIGNATED PARKING SPOT WITHOUT A PROPER PERMIT",
      "violationFee": 20000,
      "violationCode": "PHD01"
    },
    {
      "violationId": 3,
      "violationType": " PARKING IN A FIRE LANE OR BLOCKING A FIRE HYDRANT",
      "violationFee": 50000,
      "violationCode": "PFL00"
    }
  ]
}
```

---

### 2.6: Violations Update API

This is a REST API to be provided by ICELL, to update parking violations fee.

**Request:** `POST`
```json
{
  "violationCode": "string",
  "violationType": "string",
  "violationFee": "50000"
}
```

---

### 2.7: Clamp Request API

This is a REST API to be provided by ICELL, to receive notifications regarding clamping request from the enforcement agent.

**Request:** `POST`
```json
{
  "customerReferenceId": "fefe3484-1866-4185c-9534-a7ca86h0d56760",
  "customerName": "string",
  "plateNumber": {
    "PlateSource": "Lagos",
    "PlateCode": "KJA",
    "PlateType": "Private",
    "PlateNumber": " 986HH"
  },
  "violationCode": "string",
  "violationFee": "50000",
  "refernceId": "string",
  "parkingBayId": "string",
  "zoneId": "string",
  "enforcementAgentId": "string",
  "paymentStatus": "pending"
}
```

---

### 2.8: Clamp Request UPDATE API

This is a REST API to be provided by ICELL, designed to notify ICELL of any updates on clamped vehicles by the enforcement agent.

**Request:** `POST`
```json
{
  "refernceId": "string",
  "amountPaid": "20000",
  "paymentStatus": "Paid"
}
```

---

### 2.9: Tow Request API

This is a REST API to be provided by ICELL, designed to receive tow requests from enforcement agent.

**Request:** `POST`
```json
{
  "customerReferenceId": "fefe3484-1866-4185c-9534-a7ca86h0d56760",
  "customerName": "string",
  "plateNumber": {
    "PlateSource": "Lagos",
    "PlateCode": "KJA",
    "PlateType": "Private",
    "PlateNumber": " 986HH"
  },
  "violationCode": "string",
  "violationFee": "50000",
  "refernceId": "string",
  "parkingBayId": "string",
  "zoneId": "string",
  "enforcementAgentId": "string"
}
```

---

### 2.10: Tow Request UPDATE API

This is a REST API provided by Automata, to enable ICELL notify automata for any successful vehicle towed.

**Request:** `POST`
```json
{
  "refernceId": "string",
  "isTowed": true
}
```

---

### 2.11: Impounded Vehicle API

This is a REST API to be provided by ICELL, to send information and notify the system regarding impounded vehicles and payment updates.

**Request:** `POST`
```json
{}
```

---

### 2.12: Impounded Vehicle (query) API

This is a REST API to be provided by ICELL, to query status of impounded vehicles.

**Request:**
```json
{
  "refernceId": "string"
}
```

---

### 2.13: Fine and Appeal Management API (TBD)

This is a REST API to be provided by ICELL, to send information and notify the system regarding fines and appeals.

**Request:**
```json
{}
```

---

## 3: SMS Parking API

This is a REST API provided by Automata, to book a parking slot using SMS as the channel.

### 3.1 Get Parking Zones API

**Endpoint:** `api/Parking/get-parking-zones`

This is a REST API to retrieve all parking zones.

**Sample Response:**
```json
{
  "status": true,
  "statusMessage": "Successful",
  "statusCode": 200,
  "data": [
    {
      "parkingZoneName": "Ikeja",
      "parkingZoneCode": "IKJ111"
    },
    {
      "parkingZoneName": "Ikorodu",
      "parkingZoneCode": "IKD112"
    },
    {
      "parkingZoneName": "Lagos Island",
      "parkingZoneCode": "LAS114"
    }
  ]
}
```

---

### 3.2 Get Parking Bays API

**Endpoint:** `api/Parking/get-parking-bays/{ParkingZoneCode}`

This is a REST API that retrieves all parking bays based on the parking zone code.

**Response:**
```json
{
  "status": true,
  "statusMessage": "Successful",
  "statusCode": 200,
  "data": [
    {
      "parkingBayFee": 500,
      "dateCreated": "2025-02-07T09:27:14",
      "lanesNumber": 16,
      "parkingBayCode": "MDPB128",
      "parkingBayName": "Mr DotMan Parking Bay",
      "parkingZoneName": "Ikeja",
      "parkingAreaAddress": "Mr DotMan Parking Bay Street, Lagos"
    },
    {
      "parkingBayFee": 500,
      "dateCreated": "2025-03-27T00:53:20",
      "lanesNumber": 10,
      "parkingBayCode": "LOPP129",
      "parkingBayName": "Layo OnStreet Park",
      "parkingZoneName": "Ikeja",
      "parkingAreaAddress": "Layo OnStreet Park Street, Lagos"
    },
    {
      "parkingBayFee": 800,
      "dateCreated": "2025-07-17T15:00:34",
      "lanesNumber": 20,
      "parkingBayCode": "WENCO130",
      "parkingBayName": "Wenco Park",
      "parkingZoneName": "Ikeja",
      "parkingAreaAddress": "Wenco Park Street, Lagos"
    }
  ]
}
```

---

### 3.3 Parking Slot Initiation API

**Endpoint:** `api/Parking/parking-initiation`

This REST API initiates a parking slot booking, checks slot availability, and returns a booking preview.

**Request:**
```json
{
  "customerName": "Oluleke Damilola",
  "phoneNumber": "09099334411",
  "parkingHour": 2,
  "plateNumber": "SSD123ZZXZ",
  "parkingBayCode": "MDPB128",
  "parkingZoneCode": "IKJ111",
  "channel": "SMS"
}
```

**Response:**
```json
{
  "status": true,
  "statusMessage": "Parking successful",
  "statusCode": 200,
  "data": {
    "zone": "Ikeja",
    "parkingBay": "Mr DotMan Parking Bay",
    "parkingBayAddress": "Mr DotMan Parking Bay Ikeja",
    "parkingSpot": "Lane 16",
    "amount": 2000,
    "dateCreated": "Thursday, October 09 2025, 9:34 AM",
    "trnxRef": "P-20251009093444-4c1365d7",
    "parkingstatus": 1,
    "plateNumber": "ASD87VVVFF",
    "parkingHour": 4,
    "parkingTime": "2025-10-09 09:34:44",
    "expiringTime": "2025-10-09 13:34:44",
    "checkoutTime": "2025-10-09 13:34:44",
    "parkingPrice": 2000
  }
}
```

---

### 3.4 Parking Slot Confirmation API

**Endpoint:** `api/Parking/parking-confirmation`

This REST API confirms the parking slot upon payment confirmation and returns the booking reference.

**Request:**
```json
{
  "reference": "P-20251009093444-4c1365d7",
  "paymentMethod": "Airtime"
}
```

**Response:**
```json
{
  "status": true,
  "statusMessage": "Parking successful",
  "statusCode": 200,
  "data": {
    "zone": "Ikeja",
    "parkingBay": "Mr DotMan Parking Bay",
    "parkingBayAddress": "Mr DotMan Parking Bay Ikeja",
    "parkingSpot": "Lane 16",
    "amount": 2000,
    "dateCreated": "Thursday, October 09 2025, 9:34 AM",
    "trnxRef": "P-20251009093444-4c1365d7",
    "parkingstatus": 1,
    "plateNumber": "ASD87VVVFF",
    "parkingHour": 4,
    "parkingTime": "2025-10-09 09:34:44",
    "expiringTime": "2025-10-09 13:34:44",
    "checkoutTime": "2025-10-09 13:34:44",
    "parkingPrice": 2000
  }
}
```

---

### 3.5 Get Customer Parking Receipt API

**Endpoint:** `api/Parking/get-customer-parkingreceipt/{transactionReference}`

This API retrieves the parking receipt using the booking reference.

**Response:**
```json
{
  "status": true,
  "statusMessage": "Parking retrieved successfully",
  "statusCode": 200,
  "data": {
    "parkingZone": "Ikeja",
    "customerName": "Oluleke Damilola ",
    "parkingBay": "Mr DotMan Parking Bay",
    "parkingSpot": "Lane 16",
    "amount": 2000.00,
    "dateCreated": "Thursday, October 09 2025, 9:35 AM",
    "trnxRef": "1009013503197",
    "customerEmail": "08045900099@laspa.lg.gov.ng",
    "parkingstatus": 1,
    "plateNumber": "ASD87VVVFF",
    "parkingHour": 4,
    "parkingTime": "2025-10-09 09:35:03",
    "expiringTime": "2025-10-09 13:35:03",
    "checkoutTime": "2025-10-09 13:35:03",
    "parkingAgentName": "Dotun A",
    "enforcerName": "Dotun Adebowale",
    "parkingPrice": 500.00
  }
}
```