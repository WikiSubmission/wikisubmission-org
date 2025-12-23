import { Sora } from "next/font/google";

const sora = Sora({
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});

export const Fonts = {
    sora: sora,
}