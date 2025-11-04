import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card } from '../components/ui'

export default function EditProperty() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="secondary" onClick={() => navigate(`/properties/${id}`)}>
          ← Back
        </Button>
        <h1 className="text-3xl font-bold">Edit Property</h1>
      </div>

      <Card className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Coming Soon</h3>
          <p className="text-sm text-yellow-700">
            The property editing form is currently being implemented as part of STORY-001.
            This feature will allow cleaning companies to update property information.
          </p>
        </div>

        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>Planned Editing Features:</strong></p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Update property name and address</li>
            <li>Modify property type</li>
            <li>Update bedroom and bathroom counts</li>
            <li>Change customer association</li>
            <li>Edit access instructions</li>
            <li>Update utility locations</li>
            <li>Modify WiFi and parking information</li>
          </ul>
        </div>

        <div className="mt-6 pt-6 border-t">
          <Button variant="secondary" onClick={() => navigate(`/properties/${id}`)} className="w-full">
            Return to Property Details
          </Button>
        </div>
      </Card>
    </div>
  )
}
