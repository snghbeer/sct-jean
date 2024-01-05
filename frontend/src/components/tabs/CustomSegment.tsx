import React, { useState } from "react";

interface SegmentProps {
  onChange: (val: string) => void;
}

const CustomSegment = (props: SegmentProps) => {
  const [selected, setSelected] = useState("food");

  const handleSelectionChange = (value: string) => {
    setSelected(value);
    props.onChange(value);
  };

  return (
    <div className="segment-container">
      <div
        className={"segment-item " + (selected === "food" ? "active" : "")}
        onClick={() => handleSelectionChange("food")}
      >
        <input type="radio" id="food" name="segment" value="food" />
        {/* <label style={{ marginBottom: "8px" }} htmlFor="food">

           <img width={24} height={24} src={menucard} alt="menu" /> 
        </label> */}
        <label  htmlFor="food">
        <svg
          version="1.0"
          xmlns="http://www.w3.org/2000/svg"
          width="512.000000pt"
          height="512.000000pt"
          viewBox="0 0 512.000000 512.000000"
          preserveAspectRatio="xMidYMid meet"
        >
          <g
            transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
            fill="none"
            stroke="none"
          >
            <path
              d="M3865 5096 c-16 -8 -265 -250 -552 -537 -407 -409 -532 -541 -571
-601 -52 -81 -101 -201 -122 -303 -17 -77 -17 -262 -1 -340 l13 -60 316 -317
c366 -368 327 -343 557 -341 193 1 335 45 497 154 91 61 1072 1039 1099 1097
62 127 -64 261 -198 212 -15 -6 -230 -213 -478 -460 -308 -308 -462 -454 -487
-465 -160 -66 -323 77 -278 245 10 41 55 89 465 500 250 250 459 468 464 483
40 105 -27 214 -137 225 -34 3 -59 -1 -83 -13 -19 -10 -236 -219 -484 -465
-486 -484 -478 -477 -577 -468 -131 13 -215 160 -162 286 10 25 159 181 463
487 247 248 454 460 460 472 30 60 3 149 -60 196 -34 25 -105 31 -144 13z"
            />
            <path
              d="M268 5020 c-87 -26 -126 -82 -188 -269 -127 -381 -98 -793 81 -1154
107 -214 155 -270 701 -814 401 -399 449 -445 508 -472 100 -47 153 -50 441
-26 l254 21 42 -46 c23 -25 487 -525 1030 -1111 544 -586 1002 -1076 1020
-1088 44 -31 103 -38 156 -17 64 24 441 405 456 461 14 53 14 69 -4 113 -11
26 -633 655 -2183 2205 -1192 1193 -2178 2174 -2192 2181 -35 19 -90 26 -122
16z"
            />
            <path
              d="M1725 1933 c-110 -11 -163 -11 -244 -3 l-105 11 -648 -648 c-357
-356 -660 -665 -674 -685 -31 -44 -36 -117 -11 -163 8 -16 105 -118 214 -227
188 -186 200 -197 244 -203 36 -5 57 -2 90 13 33 15 242 219 836 813 l793 794
-146 158 c-131 142 -148 157 -177 156 -18 -1 -95 -8 -172 -16z"
            />
          </g>
        </svg>
        </label>
      </div>

      <div
        className={"segment-item " + (selected === "activity" ? "active" : "")}
        onClick={() => handleSelectionChange("activity")}
      >
        <input type="radio" id="activity" name="segment" value="activity" />
        <label  htmlFor="activity">
          {/* <img width={24} height={24} src={activity} alt="activity" /> */}
          <svg
            version="1.0"
            xmlns="http://www.w3.org/2000/svg"
            width="512.000000pt"
            height="512.000000pt"
            viewBox="0 0 512.000000 512.000000"
            preserveAspectRatio="xMidYMid meet"
          >
            <g
              transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
              fill="none"
              stroke="none"
            >
              <path d="M0 4765 l0 -355 2225 0 2225 0 0 355 0 355 -2225 0 -2225 0 0 -355z" />
              <path
                d="M4748 2868 l-3 -1583 -27 -98 c-107 -389 -396 -678 -785 -785 l-98
-27 -1582 -3 -1583 -2 0 -185 0 -185 2225 0 2225 0 0 2225 0 2225 -185 0 -185
0 -2 -1582z"
              />
              <path
                d="M0 2390 l0 -1720 1648 0 c1441 0 1655 2 1699 15 68 20 143 88 174
157 23 52 24 60 27 390 l4 337 351 3 c402 3 395 2 476 94 75 86 71 12 71 1296
l0 1148 -2225 0 -2225 0 0 -1720z m1150 980 l0 -150 -150 0 -150 0 0 150 0
150 150 0 150 0 0 -150z m2348 -2 l3 -148 -976 0 -975 0 0 150 0 150 973 -2
972 -3 3 -147z m-2348 -678 l0 -150 -150 0 -150 0 0 150 0 150 150 0 150 0 0
-150z m2348 3 l-3 -148 -972 -3 -973 -2 0 150 0 150 975 0 976 0 -3 -147z
m-2348 -673 l0 -150 -150 0 -150 0 0 150 0 150 150 0 150 0 0 -150z m2348 -2
l3 -148 -976 0 -975 0 0 150 0 150 973 -2 972 -3 3 -147z"
              />
              <path
                d="M4398 1315 c-61 -33 -150 -45 -350 -45 l-198 0 0 -148 c0 -183 -14
-299 -45 -377 -13 -32 -22 -61 -20 -63 8 -8 137 29 200 57 215 98 381 294 439
518 22 84 22 84 -26 58z"
              />
            </g>
          </svg>
        </label>
      </div>
    </div>
  );
};

export default CustomSegment;
