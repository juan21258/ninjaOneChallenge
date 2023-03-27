import { Selector } from 'testcafe';

class Devices {
    constructor() {
        this.addDeviceButton = Selector('a.submitButton');
        //Individual device
        this.allDevices = Selector('div.list-devices > div.device-main-box');
        this.deviceNames = Selector('div.list-devices > div.device-main-box > div.device-info > span.device-name');
        this.deviceTypes = Selector('div.list-devices > div.device-main-box > div.device-info > span.device-type')
        this.deviceCapacities = Selector('div.list-devices > div.device-main-box > div.device-info > span.device-capacity')
        this.editButton = Selector('div.list-devices > div.device-main-box > div.device-options > a');
        this.removeButton = Selector('div.list-devices > div.device-main-box > div.device-options > button');
        //specific device
        this.specificDevice = Selector('div.list-devices > div.device-main-box > div.device-info > span.device-name');
    }

    async getAllDevices() {
        const deviceCount = await this.deviceNames.count;
        const devicesArray = [];

        for (let i = 0; i < deviceCount; i++) {
            const deviceName = await this.deviceNames.nth(i).innerText;
            const deviceType = await this.deviceTypes.nth(i).innerText;
            const deviceCapacity = await this.deviceCapacities.nth(i).innerText;

            const device = {
                system_name: deviceName,
                type: deviceType,
                hdd_capacity: deviceCapacity
            };
            devicesArray.push(device);
        }
        return devicesArray;
    }

    async getAllRemoveAndEditButtons() {
        const registries = await this.allDevices.count;
        let buttonsAmount = 0;
        for (let i = 0; i < registries; i++) {
            const editAnchors = await this.editButton.nth(i).count;
            const removeButtons = await this.removeButton.nth(i).count;
            if (editAnchors === 1 && removeButtons === 1) {
            buttonsAmount += 1;
            }
        }
        return buttonsAmount;
    }
}

module.exports = Devices;