import { ALL_TRAINING_PROGRAMS } from './training-programs'

/**
 * Service selector constants and utilities
 */

// Default services
export const DEFAULT_ENTERPRISE_SERVICE = 'comprehensive-ai-training'
export const DEFAULT_INDIVIDUAL_SERVICE = 'individual-coaching'

// Service options for dropdowns
export const ENTERPRISE_SERVICE_OPTIONS = ALL_TRAINING_PROGRAMS
  .filter(program => program.category === 'enterprise')
  .map(program => ({
    value: program.id,
    label: program.title
  }))

export const INDIVIDUAL_SERVICE_OPTIONS = ALL_TRAINING_PROGRAMS
  .filter(program => program.category === 'individual')
  .map(program => ({
    value: program.id,
    label: program.title
  }))

/**
 * Get service by ID
 */
export function getServiceById(serviceId: string) {
  return ALL_TRAINING_PROGRAMS.find(program => program.id === serviceId)
}

/**
 * Get selected services for display
 */
export function getSelectedServices(enterpriseServiceId?: string, individualServiceId?: string) {
  const enterpriseService = getServiceById(enterpriseServiceId || DEFAULT_ENTERPRISE_SERVICE)
  const individualService = getServiceById(individualServiceId || DEFAULT_INDIVIDUAL_SERVICE)
  
  return {
    enterprise: enterpriseService,
    individual: individualService
  }
}