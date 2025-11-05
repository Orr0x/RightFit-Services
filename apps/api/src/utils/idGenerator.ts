import { prisma } from '@rightfit/database'

/**
 * Generate a unique customer number in the format CUST-YYYY-NNNN
 * @param serviceProviderId - The service provider ID to scope the customer number
 * @returns A unique customer number
 */
export async function generateCustomerNumber(serviceProviderId: string): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `CUST-${year}-`

  // Find the highest customer number for this year and service provider
  const latestCustomer = await prisma.customer.findFirst({
    where: {
      service_provider_id: serviceProviderId,
      customer_number: {
        startsWith: prefix,
      },
    },
    orderBy: {
      customer_number: 'desc',
    },
    select: {
      customer_number: true,
    },
  })

  let nextNumber = 1

  if (latestCustomer?.customer_number) {
    // Extract the number part and increment
    const match = latestCustomer.customer_number.match(/-(\d+)$/)
    if (match) {
      nextNumber = parseInt(match[1]) + 1
    }
  }

  // Pad with zeros to 4 digits
  const paddedNumber = nextNumber.toString().padStart(4, '0')

  return `${prefix}${paddedNumber}`
}

/**
 * Generate a unique contract number in the format CT-YYYY-NNNN
 * @param serviceProviderId - The service provider ID to scope the contract number
 * @returns A unique contract number
 */
export async function generateContractNumber(serviceProviderId: string): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `CT-${year}-`

  // Find the highest contract number for this year and service provider
  const latestContract = await prisma.cleaningContract.findFirst({
    where: {
      service_provider_id: serviceProviderId,
      contract_number: {
        startsWith: prefix,
      },
    },
    orderBy: {
      contract_number: 'desc',
    },
    select: {
      contract_number: true,
    },
  })

  let nextNumber = 1

  if (latestContract?.contract_number) {
    // Extract the number part and increment
    const match = latestContract.contract_number.match(/-(\d+)$/)
    if (match) {
      nextNumber = parseInt(match[1]) + 1
    }
  }

  // Pad with zeros to 4 digits
  const paddedNumber = nextNumber.toString().padStart(4, '0')

  return `${prefix}${paddedNumber}`
}
