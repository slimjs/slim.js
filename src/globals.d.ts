import type Component from "../component";

declare global {
  export interface Window {
    Slim: typeof Component
  }
}