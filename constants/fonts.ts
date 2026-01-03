import { Sora, Geist_Mono, Amiri } from "next/font/google";

const sora = Sora({
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});

const amiri = Amiri({
    subsets: ["arabic"],
    weight: ["400", "700"],
    variable: "--font-amiri",
});

export const Fonts = {
    sora: sora,
    geistMono: geistMono,
    amiri: amiri,
}