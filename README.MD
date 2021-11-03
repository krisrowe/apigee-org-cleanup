# Apigee Org Cleanup

# Overview

Deletes all developers and apps in the Apigee X/Hybrid org.

# Prepare

1. Clone this repo

2. Update the `org` in the [config.json](./config.json) to your Apigee org name

3. Generate an access token 
```
gcloud auth print-access-token
```

This can be done within the Cloud Shell under the Google Cloud Console, while logged in under an identity that has the Apigee Org Admin role for the project ID / org that was configured in the previous step.

4. Update the `token` in the [config.json](./config.json) to your token


5. Install the dependency node modules 
```
npm install
```

# Execute the script

```
npm start
```
