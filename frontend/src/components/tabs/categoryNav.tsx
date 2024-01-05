import { IonCol, IonIcon, IonRow } from "@ionic/react";
import { arrowBackSharp, arrowForwardSharp } from "ionicons/icons";
import { useContext, useEffect, useRef, useState } from "react";
import { CategoryProperties } from "../interfaces/interfaces";
import { PfContext } from "../util/CartContext";

export const CategoryNav = (props:CategoryProperties) => {
    const [visibleCategories, setVisibleCategories] = useState(props.categories);
    const catItemsRef = useRef<HTMLDivElement>(null);
    const [activeCategory, setActiveCategory] = useState("all");
    const allItem = useRef<HTMLDivElement | null>(null);

    const pf = useContext(PfContext);

    const handleCategoryClick = (category:string) => {
      setActiveCategory(category);
      // Handle category click logic here
    };
    const handleNextClick = (): void => {
        const catItemsContainer = catItemsRef.current;
        if (catItemsContainer) {
          catItemsContainer.scrollTo({
            left: catItemsContainer.scrollLeft + 100,
            behavior: "smooth"
          });
        }
      };
    
      const handlePreviousClick = (): void => {
        const catItemsContainer = catItemsRef.current;
        if (catItemsContainer) {
          catItemsContainer.scrollTo({
            left: catItemsContainer.scrollLeft - 100,
            behavior: "smooth"
          });
        }
      };

      useEffect(() => {
        setVisibleCategories(props.categories)
      }, [props.categories])

      useEffect(() => {
        allItem.current?.classList.add("active")
        setActiveCategory("all")
      },[props.setSuper, props.supercategory])
    
  return (
    <div className="mynavbar">
      {pf.isNative ? (<button className="navbar-button-item" id="previousButton"
      onClick={handlePreviousClick}>
        <IonIcon icon={arrowBackSharp} />
      </button>) : (<></>)}
      <div className="catItems" ref={catItemsRef}>
          <IonCol  key={0} onClick={() => {
            handleCategoryClick("all")
            props.setSelected("all")
          }}>
            <div ref={allItem} className={`navbar-item ${activeCategory === "all" ? "active" : ""}`}>all</div>
          </IonCol>
        {visibleCategories?.map((category, idx) => (
          <IonCol key={idx + 1} onClick={() => {
            handleCategoryClick(category.name)
            props.setSelected(category._id)
          }}>
            <div className={`navbar-item ${activeCategory === category.name ? "active" : ""}`}>{category.name}</div>
          </IonCol>
        ))}
      </div>
      {pf.isNative ? (<button className="navbar-button-item" id="nextButton"
      onClick={handleNextClick}>
        <IonIcon icon={arrowForwardSharp} />
      </button>) : (<></>)}
    </div>
  );
};
