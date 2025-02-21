'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const instructions = `
# Adding or editing incidents

### Table Structure
The Airtable base contains the following data:

| **Column Name**         | **Required** | **Format**                                | **Example**                 |
|-------------------------|-------------|-------------------------------------------|-----------------------------|
| Date                   | ✅           | YYYY-MM-DD                                | 2025-02-20                  |
| Time                   | ✅           | HH:mm AM/PM (12-hour)                          | 02:30 PM                        |
| Location               | ✅           | Text description                         | Canoe Landing Park, City Place       |
| Coordinates            | ✅           | "lat, lng" format                         | 40.7851, -73.9683             |
| Dog breed             | ❌           | Text                                     | Labrador Retriever           |
| Dog weight (lbs)       | ❌           | Number                                   | 65                           |
| Leashed                | ❌           | "Yes", "No", "Unknown"                   | Yes                          |
| Number of coyotes      | ❌           | Number                                   | 2                            |
| Notes                  | ✅           | Text (supports \\n for line breaks)     | Terrier mix dog attacked by coyote at June Callwood Park, about 150m from the condo building where they live. Owner had turned away for a few seconds and when she looked back, a coyote had lunged at the dog and was trying to rip him away. There were about 4 women screaming but it wasn't until a tall man came over that the coyote left. Rushed to the ER and got stitches on one wound and two bite marks. At the emergency vet, she saw two other dogs that were also attacked in the area - a golden doodle and a husky. |
| Dog injured            | ❌           | "Yes", "No", "Unknown"                   | No                           |
| Source                 | ❌           | Text                                     | FB CityPlace Dog Owners Group            |
| Publish                | ✅           | Checkbox (must be checked to appear online)     | ✅                           |
| Incident type          | ✅           | One of: 'Coyote attack on a dog (attempt)', 'Coyote attack on a dog (successful)', 'Stalked by a coyote', 'Coyote attack on a human' | 'Coyote attack on a dog (attempt)' |


### Adding New Incidents

1. Log in to [Airtable](https://airtable.com/appWzTXQJpDAVuJNQ/tblgC4DvR3ReCyHG1/viwTUjFqDIytNkN8w?blocks=hide)
2. Navigate to the "Toronto Coyote Incidents" table
3. Click the "+" button at the very bottom of the table to add a new row
4. Fill in the required fields, and as many of the optional fields as possible
5. Find latitude and longitude coordinates from google maps by searching for the location, and right clicking on the correct area on the map. Tap the coordinates to copy it. 
6. Double-check coordinates if provided (should be in "lat, lng" format)
7. To have it show on the map, make sure "Publish" is checked and all required columns are filled in

### Data Quality Guidelines

- Ensure dates are in YYYY-MM-DD format
- Use 12-hour time format with AM / PM (HH:mm AM/PM) eg: 12:00 PM
- Updating column names will break the app
`

export default function AdminPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="prose dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {instructions}
        </ReactMarkdown>
      </div>
    </div>
  )
}
