# I left it
The ultimate web service for safeguarding your confidential text data. 

https://ileftit.com/

## Core Design

### Client-Side Encryption

- The app generates secret values: **key**, **iv**, and **salt** in the browser.
- The app creates a **crypto key** from **key** and **salt** with PBKDF2 using 100,000 iterations in the browser.

- The app encrypts plain text using **crypto key** and **iv** with AES256-GCM in the browser.
- The app creates an **auth key** from the **crypto key** using SHA-512.
- The app sends the **encrypted data** and the **auth key** to the server to persist and receives an ID for the item.
- The app shows the URL of the item and the secret for opening it.
- The user copies them and shares them with anyone.
            
### Timed Access

- Anyone cannot try decrypting the item before open time even if the user is owner.
- The owner user of the item can extends its open time.

### Security risks

- If a user account is compromised, there is a possibility of adding, deleting, replacing, or extending the publication date of data, but the contents of the data will not be viewed.
- Even if the secret for decryption is leaked, the contents of the data will not be exposed immediately as long as the publication date has not been reached.
- Even if the server is compromised, the data is encrypted, and the decryption key is not stored on the server, so the contents of the data will not be exposed immediately, but it may be susceptible to brute force attacks.