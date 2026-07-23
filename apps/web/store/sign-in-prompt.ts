import { create } from 'zustand'

interface SignInPromptState {
  isOpen: boolean
  open: () => void
  close: () => void
}

export const useSignInPromptStore = create<SignInPromptState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))
