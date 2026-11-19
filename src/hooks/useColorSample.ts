/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** useColorSample.ts
 */

import { useSyncExternalStore } from 'react'

import { getColorSample, subscribeColorSample } from '../tools/colorPicker/colorSample'

export function useColorSample(): string | null {
  return useSyncExternalStore(subscribeColorSample, getColorSample)
}
