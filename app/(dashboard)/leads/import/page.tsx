"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Download, FileX, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { ImportDropzone } from "./components/ImportDropzone";
import { LeadsPreviewTable } from "./components/LeadsPreviewTable";
import { LeadRowWithValidation } from "../../../../types/leads";
import { parseLeadsFile, downloadTemplate } from "../../../../lib/utils";
import { CreateLeadInput, useBulkCreateLeads } from "@/hooks/useLeads";

const ImportLeadsPage = () => {
  const [rows, setRows] = useState<LeadRowWithValidation[]>([]);
  const [fileName, setFileName] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [errors, setErrors] = useState<{ row: number; reason: string }[]>([]);

  const validRows = rows.filter((r) => r.errors.length === 0);
  const invalidRows = rows.filter((r) => r.errors.length > 0);
  const hasParsed = rows.length > 0;

  const { mutateAsync: createLeads } = useBulkCreateLeads();

  const handleFile = async (file: File) => {
    setErrors([]);
    setIsParsing(true);
    setFileName(file.name);
    try {
      const parsed = await parseLeadsFile(file);
      if (parsed.length === 0) {
        toast.error("The file appears to be empty.");
        setRows([]);
        setFileName("");
        return;
      }
      setRows(parsed);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to parse file.");
      setRows([]);
      setFileName("");
    } finally {
      setIsParsing(false);
    }
  };

  const handleClearFile = () => {
    setRows([]);
    setFileName("");
  };

  const handleImport = async () => {
    if (validRows.length === 0) return;
    setIsImporting(true);

    const leadsToImport: CreateLeadInput[] = validRows.map((row) => ({
      fullName: row.fullName,
      email: row.email,
      phone: row.phone,
      address1: row.address1,
      address2: row.address2,
      city: row.city,
      state: row.state,
      country: row.country,
      postalCode: row.postalCode,
      source: row.campaign.toUpperCase(),
      productSKUs: [
        row.product1,
        row.product2,
        row.product3,
        row.product4,
        row.product5,
      ].filter(Boolean) as string[],
      note: "",
    }));
    const response = await createLeads(leadsToImport);

    if (response.errors.length > 0) setErrors(response.errors);

    if (response.failed > 0) {
      setErrors(response.errors);
      toast.error(
        `Failed to import ${response.failed} lead${response.failed > 1 ? "s" : ""}.`,
      );
    }

    toast.success(`${response.imported} leads imported successfully!`);
    setIsImporting(false);
    setRows([]);
    setFileName("");
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
          <Link href="/leads">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Leads
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Import Leads</h1>
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Upload an Excel file to bulk import leads. Download the template above
          to get started.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upload File</CardTitle>
          </CardHeader>
          <CardContent>
            {isParsing ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16">
                <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Parsing file…</p>
              </div>
            ) : hasParsed ? (
              <div className="flex items-center justify-between rounded-lg border px-4 py-3 bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                    <Download className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {rows.length} rows parsed
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={handleClearFile}
                >
                  <FileX className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            ) : (
              <ImportDropzone onFile={handleFile} />
            )}
          </CardContent>
        </Card>

        {hasParsed && (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Preview
                    <span className="ml-2 text-muted-foreground font-normal text-sm">
                      ({rows.length} {rows.length === 1 ? "row" : "rows"})
                    </span>
                  </CardTitle>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-emerald-600 font-medium">
                      {validRows.length} valid
                    </span>
                    <Separator orientation="vertical" className="h-4" />
                    <span
                      className={
                        invalidRows.length > 0
                          ? "text-destructive font-medium"
                          : "text-muted-foreground"
                      }
                    >
                      {invalidRows.length} invalid
                    </span>
                  </div>
                </div>
                {invalidRows.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Invalid rows are highlighted in red and will be skipped
                    during import.
                  </p>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <LeadsPreviewTable rows={rows} />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4 pb-8">
              <Button variant="outline" onClick={handleClearFile}>
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={validRows.length === 0 || isImporting}
              >
                {isImporting && (
                  <Loader2Icon className="h-4 w-4 animate-spin mr-1" />
                )}
                {isImporting
                  ? "Importing…"
                  : `Import ${validRows.length} Lead${validRows.length === 1 ? "" : "s"}`}
              </Button>
            </div>
          </>
        )}
      </div>
      {errors.length > 0 &&
        errors.map((error) => (
          <div className="py-4" key={error.row}>
            <div className="text-red-500">{`Error at row ${error.row}: ${error.reason}`}</div>
          </div>
        ))}
    </div>
  );
};

export default ImportLeadsPage;
