import ResourceNotFound from '@/components/dashbord/Resource-not-found'

const NotFound = () => {
  const props = {
    message: "Les données du fournisseur sont inexistantes ou introuvables.",
    backUrl: "/dashboard/fournisseurs/liste"
  }

  return (
    <>
        <ResourceNotFound {...props}/>
    </>
  )
}

export default NotFound
