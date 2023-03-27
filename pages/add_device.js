import { Selector } from 'testcafe';

class AddDevice {
    constructor() {
        this.systemNameInput = Selector('div.device-form > input#system_name');
        this.typeDropdown = Selector('select#type');
        this.windowsWorkStationOption = Selector('option[value="WINDOWS_WORKSTATION"]');
        this.capacityInput = Selector('div.device-form > input#hdd_capacity');
        this.saveButton = Selector('a.changebutton > button.submitButton');
    }
}

module.exports = AddDevice;