import {
    Inria_Serif,
    Julius_Sans_One,
    Rozha_One,
    Assistant,
  } from "next/font/google";
  
  export const inriaSerif = Inria_Serif({
    subsets: ["latin"],
    weight: ["300", "400", "700"],
    variable: "--font-inria-serif",
  });
  export const juliusSansOne = Julius_Sans_One({
    subsets: ["latin"],
    weight: "400",
  });
  export const rozha_One = Rozha_One({ subsets: ["latin"], weight: "400" });
  export const assistant = Assistant({
    subsets: ["latin"],
    weight: ["200", "300", "400", "500", "600", "700", "800"],
    variable: "--font-assistant",
  });