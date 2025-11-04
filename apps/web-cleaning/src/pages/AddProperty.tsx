import { useNavigate } from 'react-router-dom'
import { Button, Card } from '../components/ui'

export default function AddProperty() {
  const navigate = useNavigate()

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="secondary" onClick={() => navigate('/properties')}>
          ← Back
        </Button>
        <h1 className="text-3xl font-bold">Add Property</h1>
      </div>

      <Card className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Coming Soon</h3>
          <p className="text-sm text-yellow-700">
            The property creation form is currently being implemented as part of STORY-001.
            This feature will allow cleaning companies to add properties they service.
          </p>
        </div>

        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>Planned Features:</strong></p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Property name and address</li>
            <li>Property type (House, Flat, etc.)</li>
            <li>Bedrooms and bathrooms</li>
            <li>Customer association</li>
            <li>Access instructions</li>
          </ul>
        </div>

        <div className="mt-6 pt-6 border-t">
          <Button variant="secondary" onClick={() => navigate('/properties')} className="w-full">
            Return to Properties
          </Button>
        </div>
      </Card>
    </div>
  )
}
