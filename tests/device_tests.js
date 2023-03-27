import Devices from '../pages/devices';
import AddDevice from '../pages/add_device';

const devices = new Devices();
const addDevice = new AddDevice();
const DataConstants = require('../constants/data_constants');
const data = new DataConstants();
const devicesMatch = (obj1, obj2) => {
  return Object.entries(obj1).every(([key, value]) => obj2[key] === value);
}

fixture('Device Management')
  .beforeEach(async (t) => {
    await t.navigateTo(data.uiUrl);
  })

  test('Test 1: Device List Verification.', async t => {
    //API Get process
    const response = await fetch(data.backendUrl+'devices');
    const resp = await response.json();
    const apiDevices = [];
    for (let i = 0; i < resp.length; i++) {
      apiDevices.push(resp[i]);
    }
    /*
    We modify the list to compare the full object, because the api presents values that
    don't exist in the UI
    */
    apiDevices.forEach(apiDevice => {
      delete apiDevice.id;
      apiDevice.hdd_capacity += ' GB'
    });

    //UI Device list process
    const uidevices = await devices.getAllDevices()

    //Here we assert all the elements present in the page against the API content
    for (let i = 0; i < resp.length; i++) {
      const result = apiDevices.some(obj1 => {
        return uidevices.some(obj2 => devicesMatch(obj1, obj2));
      });

      await t.expect(result).eql(true);
    }

    //Here we assert that each device has the edit and remove button
    const editAndRemoveAmount = await devices.getAllRemoveAndEditButtons();
    await t.expect(editAndRemoveAmount).eql(uidevices.length);

  });

  test('Test 2: Device creation and display validation test"', async t => {
    //Test data
    const systemNameValue = 'NINJA';
    const systemTypeValue = 'WINDOWS WORKSTATION';
    const systemCapacityValue = '100';
    //Device creation
    await t.expect(devices.addDeviceButton.visible).ok();
    await t.click(devices.addDeviceButton);
    await t.expect(addDevice.systemNameInput.visible).ok();
    await t.typeText(addDevice.systemNameInput, systemNameValue);
    await t.click(addDevice.typeDropdown);
    await t.click(addDevice.windowsWorkStationOption);
    await t.typeText(addDevice.capacityInput, systemCapacityValue);
    await t.click(addDevice.saveButton);
    await t.expect(devices.addDeviceButton.visible).ok();
    //Validation
    const devicesAmount = await devices.allDevices.count
    let registerFound = false;
    for (let i = 0; i < devicesAmount; i++) {
      if(await devices.deviceNames.nth(i).innerText === systemNameValue) {
        const systemType = await devices.deviceTypes.nth(i).innerText;
        const systemCapacity = await devices.deviceCapacities.nth(i).innerText;
        await t.expect(systemType).eql(systemTypeValue);
        await t.expect(systemCapacity).eql(systemCapacityValue + ' GB');
        registerFound = true;
        break;
      }
    }
    //If the boolean is false is because the element wasn't found
    if(registerFound === false) {
      throw new Error("The device wasn't created successfully");
    }
  });

  test('Test 3: Device Renaming Test', async t => {
    const newSystemName = 'Renamed Device';
    //API Get process
    const response = await fetch(data.backendUrl+'devices');
    const resp = await response.json();
    const apiDevices = [];
    for (let i = 0; i < resp.length; i++) {
      apiDevices.push(resp[i]);
    }
    //Name modification
    apiDevices[0].system_name = newSystemName;
    
    //API PUT process
    fetch(data.backendUrl+`devices/${apiDevices[0].id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiDevices[0])
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error updating device');
      }
    })
    .catch(error => {
      console.error('Error updating device:', error);
    });
    //Page refresh and validation
    await t.eval(() => location.reload(true));
    const devicesAmount = await devices.allDevices.count
    let registerUpdated = false;
    for (let i = 0; i < devicesAmount; i++) {
      if(await devices.deviceNames.nth(i).innerText === newSystemName) {
        const systemType = await devices.deviceTypes.nth(i).innerText;
        const systemCapacity = await devices.deviceCapacities.nth(i).innerText;
        await t.expect(systemType).eql(apiDevices[0].type);
        await t.expect(systemCapacity).eql(apiDevices[0].hdd_capacity + ' GB');
        registerUpdated = true;
        break;
      }
    }
    //If the boolean is false is because the device wasn't updated
    if(registerUpdated === false) {
      throw new Error("The device wasn't updated successfully");
    }
  });

  test('Test 4: Verify deletion of the last element', async t => {
    //API Get process
    const response = await fetch(data.backendUrl+'devices');
    const resp = await response.json();
    const apiDevices = [];
    for (let i = 0; i < resp.length; i++) {
      apiDevices.push(resp[i]);
    }
    const lastDevice = await devices.allDevices.count - 1;
    const lastElementName = apiDevices[lastDevice].system_name
    //API DELETE process
    fetch(data.backendUrl+`devices/${apiDevices[lastDevice].id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error deleting resource');
      }
    })
    .catch(error => {
      console.error('Error deleting resource:', error);
    });
    //Page refresh and validation
    await t.eval(() => location.reload(true));
    const devicesAmount = await devices.allDevices.count
    for (let i = 0; i < devicesAmount; i++) {
      if(await devices.deviceNames.nth(i).innerText === lastElementName) {
        throw new Error("The device wasn't deleted successfully");
      }
    }
  });