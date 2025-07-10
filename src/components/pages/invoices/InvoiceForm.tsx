"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function InvoiceForm() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href="/invoices">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoices
          </Button>
        </Link>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>New Invoice</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Invoice Number</Label>
                <Input placeholder="INV-001" />
              </div>
              <div className="space-y-2">
                <Label>Invoice Date</Label>
                <Input type="date" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Customer</Label>
              <select className="w-full p-2 border rounded-md">
                <option>Select a customer...</option>
              </select>
            </div>

            <div className="space-y-4">
              <Label>Line Items</Label>
              <div className="border rounded-lg p-4">
                <p className="text-center text-gray-500">Add items to your invoice</p>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Link href="/invoices">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button>Save Invoice</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}