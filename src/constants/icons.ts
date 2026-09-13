import adobe from "@/assets/icons/adobe.png";
import canva from "@/assets/icons/canva.png";
import claude from "@/assets/icons/claude.png";
import dropbox from "@/assets/icons/dropbox.png";
import figma from "@/assets/icons/figma.png";
import github from "@/assets/icons/github.png";
import logo from "@/assets/icons/logo.png";
import medium from "@/assets/icons/medium.png";
import notion from "@/assets/icons/notion.png";
import openai from "@/assets/icons/openai.png";
import spotify from "@/assets/icons/spotify.png";

export const icons = {
  logo,
  notion,
  dropbox,
  openai,
  adobe,
  medium,
  figma,
  spotify,
  github,
  claude,
  canva,
} as const;

export type IconKey = keyof typeof icons;
