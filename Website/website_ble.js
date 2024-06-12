//=============================================================================
//
//    FILE  : website_ble.js
//
//  PROJECT : Any Chrome-based Web App requiring access to a Bluetooth Device
//
//   AUTHOR : Bill Daniels (bill@dstechlabs.com)
//            See LICENSE.md
//
//=============================================================================

//--- Globals ---------------------------------------------

const deviceServiceUUID = '00001815-0000-1000-8000-00805f9b34fb';
const commandCharUUID   = '00002b26-0000-1000-8000-00805f9b34fb';
const responseCharUUID  = '00002b99-0000-1000-8000-00805f9b34fb';

const dataWindow  = document.getElementById ('dataWindow');
const textEncoder = new TextEncoder ();
const textDecoder = new TextDecoder ();

let btDevice     = undefined;
let btServer     = undefined;
let btService    = undefined;
let commandChar  = undefined;
let responseChar = undefined;

//--- scanForDevices --------------------------------------

async function scanForDevices ()
{
  try
  {
    // Scan for bluetooth devices
    btDevice = await navigator.bluetooth.requestDevice
    ({


      //----------------------
      // Look for all devices
      //----------------------
      acceptAllDevices : true,
      optionalServices : [deviceServiceUUID]  // Required to access service later



      // //----------------------
      // // With device name
      // //----------------------
      // filters :
      // [{
      //   name : 'My BLE Device'
      // }]



      // //----------------------
      // // With services
      // //----------------------
      // filters :
      // [{
      //   services : [0x1234, 0x12345678, '99999999-0000-1000-8000-00805f9b34fb']
      // }]



      // //----------------------
      // // With named service
      // //----------------------
      // filters :
      // [{
      //   services : ['battery_service']
      // }]



    });

    // Remove scan button and show communications
    document.getElementById ('scanButton').style.display = 'none';
    document.getElementById ('comms'     ).style.display = 'inline';

    // Connect to selected device's GATT Server
    btServer = await btDevice.gatt.connect ();
    dataWindow.innerHTML += 'Connected to ' + btDevice.name + '<br>';

    // Get Service
    btService = await btServer.getPrimaryService (deviceServiceUUID);  // BLE Device Service

    // Get all characteristics
    commandChar  = await btService.getCharacteristic (commandCharUUID );  // Characteristic to send commands to device
    responseChar = await btService.getCharacteristic (responseCharUUID);  // Characteristic to receive responses from device

    // Subscribe to device values
    responseChar.startNotifications ();
    responseChar.addEventListener ('characteristicvaluechanged', updateValue);
  }
  catch (ex)
  {
    alert (ex);
  }
}

//--- sendCommand -----------------------------------------

function sendCommand ()
{
  try
  {
    if (commandChar != undefined)
    {
      // Values sent to a Bluetooth device must be an ArrayBuffer of bytes
      const value   = document.getElementById ('commandField').value;
      const btValue = textEncoder.encode (value);  // Encode value into Uint8Array (UTF-8 bytes)

      commandChar.writeValueWithResponse (btValue);
      dataWindow.innerHTML += '◀── ' + value + '<br>';
    }
  }
  catch (ex)
  {
    alert (ex);
  }
}

//--- updateValue -----------------------------------------

function updateValue (event)
{
  try
  {
    // BT data is received as a JavaScript DataView object
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView
    // Use a TextDecoder to convert to string
    const stringValue = textDecoder.decode (event.target.value);
    dataWindow.innerHTML += '──▶ ' + stringValue + '<br>';
  }
  catch (ex)
  {
    alert (ex);
  }
}
