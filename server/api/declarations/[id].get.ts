export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? ''
  const declaration = await useDeclarationRepository(event).findById(id)

  if (!declaration) throw createError({ statusCode: 404, statusMessage: 'not_found' })
  if (Date.parse(declaration.expiresAt) <= Date.now()) {
    throw createError({ statusCode: 410, statusMessage: 'expired' })
  }

  return declaration
})
