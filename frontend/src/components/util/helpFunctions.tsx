import { Capacitor } from "@capacitor/core";
import { Device } from "@capacitor/device";
import { createAnimation } from "@ionic/react";
import { CategoryProps } from "../interfaces/interfaces";

export function groupCategoriesBySuperCategory(categories: CategoryProps[], superCategories: CategoryProps[]) {
  const groupedCategories:any = {};

  // Create an entry for each supercategory with an empty array
  superCategories.forEach(superCategory => {
    groupedCategories[superCategory._id!] = [];
  });

  // Group categories by their supercategory ID
  categories.forEach(category => {
    groupedCategories[category.superCategory!].push(category);
  });

  return groupedCategories;
}

function capitalizeFirstLetter(string: string) {
    return string[0].toUpperCase() + string.slice(1);
}

function jsonToFormData(ajson: any, aFormdata: FormData): FormData {
    for (const prop in ajson) {
      if (ajson.hasOwnProperty(prop) && ajson[prop] !== "") {
        aFormdata.append(prop, ajson[prop]);
      }
    }
    return aFormdata;
  }

  function isDatePassed(date: Date) {
    // Get the current date
    var today = new Date();
  
    // Set the time to midnight for accurate comparison
    today.setHours(0, 0, 0, 0);
  
    // Compare the dates
    if (date < today) {
      // Date has passed
      return true;
    } else return false;
  }

  function haveSameDay(date1: Date, date2: Date): boolean {
    const day1 = date1.getDate();
    const month1 = date1.getMonth();
    const year1 = date1.getFullYear();
  
    const day2 = date2.getDate();
    const month2 = date2.getMonth();
    const year2 = date2.getFullYear();
  
    return day1 === day2 && month1 === month2 && year1 === year2;
  }

  const enterAnimation = (baseEl: HTMLElement) => {
    const root = baseEl.shadowRoot;

    const backdropAnimation = createAnimation()
      .addElement(root?.querySelector('ion-backdrop')!)
      .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

    const wrapperAnimation = createAnimation()
      .addElement(root?.querySelector('.modal-wrapper')!)
      .keyframes([
        { offset: 0, opacity: '0', transform: 'scale(0)' },
        { offset: 1, opacity: '0.99', transform: 'scale(1)' },
      ]);

    return createAnimation()
      .addElement(baseEl)
      .easing('ease-out')
      .duration(350)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  };

  const leaveAnimation = (baseEl: HTMLElement) => {
    return enterAnimation(baseEl).direction('reverse');
  };

  const testAnim = () => {

    return createAnimation()
    .duration(400)
    .easing('ease-out')
    .fromTo('transform', 'translateX(0px)', 'translateX(100px)')
    .fromTo('opacity', '1', '0.2');
  }

  const goBackAnimation = () => {
    const container = document.getElementById('menuPage');
    container?.classList.add("slide-in-exit")

  }

  const goNextAnimation = () => {
    const container = document.getElementById('cartPage');
    container?.classList.add("slide-in-enter")
  }

  const isNative = async () => {
    const info = await Device.getInfo();
    const isNative = (info.operatingSystem === "ios" || info.operatingSystem === "android")
    return isNative
  }

  const isTablet = async () => {
    const info = await Device.getInfo();
    
    const isNative = (Capacitor.getPlatform() !== "web" && (info.operatingSystem === "ios" || info.operatingSystem === "android"))
    return isNative
  }

  const isTabletOrWeb = async () => {
    const tablet = await isTablet()
    const isWeb = Capacitor.getPlatform() === "web"
    return tablet || isWeb
  }
  
  const isWebView = async () => {
    const info = await Device.getInfo();

    const isWeb = Capacitor.getPlatform() === "web" && !(info.operatingSystem === "ios" || info.operatingSystem === "android")
    return isWeb 
  }

  function round(num:number) {
    return (Math.floor(num * 100) / 100);
  }

export  {
    enterAnimation, leaveAnimation, isNative, isTablet, isWebView, round, isTabletOrWeb,
    capitalizeFirstLetter,
    jsonToFormData,
    isDatePassed, haveSameDay, testAnim, goBackAnimation, goNextAnimation
};