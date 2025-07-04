import { DataTable } from '@/components/data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl lg:text-5xl font-extrabold font-headline tracking-tight text-primary">
            React Data Stream Table
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            A high-performance table with pagination, column resizing & reordering.
          </p>
        </div>
        <Card className="shadow-2xl shadow-primary/10">
            <CardHeader>
                <CardTitle>Live Data Feed</CardTitle>
                <CardDescription>
                    The table below supports pagination for smooth navigation through large datasets.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <DataTable />
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
