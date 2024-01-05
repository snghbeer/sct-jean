import { registerPlugin } from '@capacitor/core';

interface ICustomKioskPlugin{
    enableKioskMode(): Promise<void>;
    disableKioskMode(): Promise<void>;
}

const CustomKioskPlugin = registerPlugin<ICustomKioskPlugin>('CustomKioskPlugin');

export default CustomKioskPlugin;
