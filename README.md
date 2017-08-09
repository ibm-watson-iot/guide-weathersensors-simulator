## Watson IoT Platform getting started guides

This sample application is included as a component in a set of guides that step through the basics of integrating IBM Watson IoT Platform with IBM Watson Analytics and IBM Data Science Experience.
For more information about the guides, see the [Watson IoT Platform documentation](https://console.bluemix.net/docs/services/IoT/getting_started/getting-started-iot-overview.html).

# Weather sensors simulator
<img src="preview.png">

A web app that simulates several weather sensors in the Haifa region that send data to IBM Watson IoT Platform.

## Run your own copy of the web application

### Deploy through Bluemix devOps

Click on the button below and follow the instructions in Bluemix to deploy and view your web app (you might want to right-click and select "Open Link in New Tab" so that you can go back to this tab later).

[![Create toolchain](https://bluemix.net/devops/graphics/create_toolchain_button.png)](https://bluemix.net/deploy?repository=https://github.com/ibm-watson-iot/guide-weathersensors-simulator)
<br />(via Continuous Delivery)

The device simulator will need access to your WIoTP service in order to delete/create devices and device types, and also to publish device events. WIoTP access credentials are called API key and authentication token. Follow the instructions on [step 5 of this recipe](https://developer.ibm.com/recipes/tutorials/how-to-register-devices-in-ibm-iot-foundation/#r_step5) to create the credentials. Don't forget to write down the authentication token as it will not be available after you finish the process of creating your API key.
You will also need the ID of your WIoTP service (also called "Org"). It can be found underneath your user name on the top right corner of the WIoTP page.

Back to the simulator web app, fill in the fields (org, API Key and authentication token), then click on **Run Simulator**.

The information box at the top will display the current status of simulation. When done, you should see a **success** message.  
If you want to delete the devices and device types created by the simulator from your WIoTP service, just click on **Delete simulated devices**.

### Troubleshooting

If you notice any problems in the simulator, try restarting the web app in [Bluemix Apps dashboard](https://console.bluemix.net/dashboard/apps). Once it restarts, refresh the page and try running the simulator again.

## Useful links
[Install Node.js]: https://nodejs.org/en/download/
[bluemix_dashboard_url]: https://console.ng.bluemix.net/dashboard/
[bluemix_signup_url]: https://console.ng.bluemix.net/registration/
[cloud_foundry_url]: https://github.com/cloudfoundry/cli

[IBM Bluemix](https://bluemix.net/)  
[IBM Bluemix Documentation](https://www.ng.bluemix.net/docs/)  
[IBM Bluemix Developers Community](http://developer.ibm.com/bluemix)  
[IBM Watson Internet of Things](http://www.ibm.com/internet-of-things/)  
[IBM Watson IoT Platform](http://www.ibm.com/internet-of-things/iot-solutions/watson-iot-platform/)   
[IBM Watson IoT Platform Developers Community](https://developer.ibm.com/iotplatform/)
