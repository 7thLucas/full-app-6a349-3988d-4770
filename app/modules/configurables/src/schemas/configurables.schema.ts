/* START: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */
export interface FieldSchemaType {
  fieldName?: string;
  type:
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "array"
    | "color"
    | "url"
    | "enum"
    | "datetime"
    | "file"
    | "files";
  required?: boolean;
  label?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[];
  fields?: FieldSchemaType[];
  item?: FieldSchemaType;
}
/* END: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */

export type ConfigurableSchemas = {
  formSchema: FieldSchemaType[];
};



export const configurableSchemas: ConfigurableSchemas = {
  formSchema: [
    {
      fieldName: "appName",
      type: "string",
      required: true,
      label: "App Name",
    },
    {
      fieldName: "logoUrl",
      type: "url",
      required: true,
      label: "Logo URL",
    },
    {
      fieldName: "tagline",
      type: "string",
      required: false,
      label: "Tagline",
    },
    {
      fieldName: "loyaltyProgramName",
      type: "string",
      required: false,
      label: "Loyalty Program Name",
    },
    {
      fieldName: "supportPhone",
      type: "string",
      required: false,
      label: "Support / Concierge Phone",
    },
    {
      fieldName: "brandColor",
      type: "object",
      required: true,
      label: "Brand Color",
      fields: [
        { fieldName: "primary", type: "color", required: true, label: "Primary (Deep Brown)" },
        { fieldName: "secondary", type: "color", required: true, label: "Secondary (Warm Grey)" },
        { fieldName: "accent", type: "color", required: true, label: "Accent (Hong Tang Red)" },
      ],
    },
    {
      fieldName: "backgroundColor",
      type: "color",
      required: false,
      label: "Background (Textured Cream)",
    },
    {
      fieldName: "heroBanners",
      type: "array",
      label: "Home Hero Banners",
      item: {
        type: "object",
        fields: [
          { fieldName: "title", type: "string", required: true, label: "Title" },
          { fieldName: "subtitle", type: "string", required: false, label: "Subtitle" },
          { fieldName: "imageUrl", type: "url", required: false, label: "Image URL" },
        ],
      },
    },
    {
      fieldName: "promoRows",
      type: "array",
      label: "Home Promo Rows",
      item: {
        type: "object",
        fields: [
          { fieldName: "heading", type: "string", required: true, label: "Heading" },
          { fieldName: "subtext", type: "string", required: false, label: "Subtext" },
        ],
      },
    },
  ],
};
