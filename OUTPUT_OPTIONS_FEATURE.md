# Output Options & JSON Validation Feature

## Date: November 22, 2025

---

## 🎯 **NEW FEATURES**

### **1. Selective Output Generation**
Users can now choose exactly what they want to generate using checkboxes:

- ☑️ **Generate JSON Image Prompt** - 2000+ word comprehensive image spec
- ☑️ **Generate JSON Video Prompt** - Complete video generation spec
- ☑️ **Generate Caption** - Structured social media caption
- ☑️ **Generate Actual Image** - Physical image generation
  - 📊 **Number of Images**: Dropdown to select 1 or 2 variations

### **2. JSON Validation**
All generated JSON prompts are now **validated automatically**:
- Must pass `JSON.parse()` without errors
- Automatically re-formatted for consistency
- Clear error messages if validation fails
- Console logs show validation status

---

## 📋 **UI CHANGES**

### **New Control Panel Section: "Output Options"**

Located in ControlsPanel, below the Mode selection:

```
┌─────────────────────────────────┐
│ Output Options                  │
├─────────────────────────────────┤
│ Select what you want to generate│
│                                 │
│ ☑ Generate JSON Image Prompt   │
│ ☑ Generate JSON Video Prompt   │
│ ☑ Generate Caption              │
│ ☑ Generate Actual Image         │
│   ├─ Number of Images           │
│   └─ [1 Image ▼]               │
└─────────────────────────────────┘
```

### **Generate Button Behavior**
- **Disabled** when NO options are selected
- Shows "Generating..." during API calls
- Only makes API calls for selected options

---

## ⚙️ **HOW IT WORKS**

### **Backend Flow:**

1. **User selects options** → State updated in `useAssetGenerator`
2. **User clicks Generate** → Options passed to pipeline
3. **Pipeline receives options** → `GenerationPipeline.run(... options)`
4. **Step 1: Text Generation**
   - Generates only selected outputs
   - Skips unselected prompts (returns empty strings)
   - Validates JSON for image/video prompts
5. **Step 2: Image Generation (Conditional)**
   - Only runs if "Generate Actual Image" is checked
   - Generates 1 or 2 images based on dropdown selection
   - Skipped entirely if unchecked (saves API calls!)
6. **Output Display**
   - Only shows generated content
   - Hides empty/skipped sections

---

## 💾 **STATE MANAGEMENT**

### **New State Variables (useAssetGenerator)**

```typescript
const [generateImagePrompt, setGenerateImagePrompt] = useState(true);
const [generateVideoPrompt, setGenerateVideoPrompt] = useState(true);
const [generateCaption, setGenerateCaption] = useState(true);
const [generateActualImage, setGenerateActualImage] = useState(true);
const [numberOfImages, setNumberOfImages] = useState<1 | 2>(2);
```

**Default:** All enabled, 2 images

### **Options Object Structure**

```typescript
interface OutputOptions {
    generateImagePrompt: boolean;
    generateVideoPrompt: boolean;
    generateCaption: boolean;
    generateActualImage: boolean;
    numberOfImages: 1 | 2;
}
```

---

## 🔬 **JSON VALIDATION**

### **Validation Method (GenerationPipeline)**

```typescript
private validateJSON(jsonString: string, fieldName: string): string {
    try {
        // Try to parse the JSON
        const parsed = JSON.parse(jsonString);
        // If successful, stringify it again to ensure proper formatting
        return JSON.stringify(parsed);
    } catch (error) {
        console.error(`[JSON Validation Failed] ${fieldName}:`, error);
        console.error(`[Invalid JSON String]:`, jsonString);
        throw new Error(`Generated ${fieldName} is not valid JSON. Please regenerate.`);
    }
}
```

### **When Validation Runs**

After text AI generates the spec, before returning:

```typescript
if (options.generateImagePrompt && spec.jsonImagePrompt) {
    console.log("[Validating] jsonImagePrompt...");
    spec.jsonImagePrompt = this.validateJSON(spec.jsonImagePrompt, "jsonImagePrompt");
    console.log("✓ jsonImagePrompt is valid JSON");
}
```

### **Validation Rules (Added to Prompts)**

```
CRITICAL JSON FORMATTING RULES:
1. jsonImagePrompt and jsonVideoPrompt MUST be valid, parseable JSON strings
2. Use proper JSON escaping for quotes: \" not '
3. No trailing commas in arrays or objects
4. All property names must be in double quotes
5. No comments allowed in JSON
6. Ensure all nested objects and arrays are properly closed
7. Test JSON validity before returning (mentally parse it)
```

---

## 📊 **COST SAVINGS EXAMPLES**

### **Example 1: Only need JSON prompts (no images)**
**Before:** Always generated 2 images = 3 API calls (1 text + 2 image)
**Now:** Uncheck "Generate Actual Image" = 1 API call (1 text only)
**Savings:** 66% fewer API calls, ~70% cost reduction

### **Example 2: Just need 1 image**
**Before:** Always generated 2 images = 3 API calls
**Now:** Select "1 Image" = 2 API calls (1 text + 1 image)
**Savings:** 33% fewer API calls, ~35% cost reduction

### **Example 3: Only caption needed**
**Before:** Generated everything = 3 API calls
**Now:** Check only "Generate Caption" = 1 API call
**Savings:** 66% fewer API calls, ~70% cost reduction

---

## 🎨 **UI DISPLAY BEHAVIOR**

### **OutputPanel Conditional Rendering**

```typescript
// Caption - only if generated
{formattedCaption && (
    <div className="form-group">
        <label>Caption</label>
        <textarea readOnly value={formattedCaption}></textarea>
    </div>
)}

// JSON Image Prompt - only if generated and not empty
{output.jsonImagePrompt && output.jsonImagePrompt.trim() !== '' && (
    <div className="form-group spec-panel">
        <label>jsonImagePrompt (JSON)</label>
        <textarea readOnly value={output.jsonImagePrompt}></textarea>
    </div>
)}

// Same for jsonVideoPrompt
```

### **Empty Values**

When a prompt is not generated:
- Text AI returns: `""` (empty string) or `null`
- OutputPanel: Hides that section completely
- No placeholder or "not generated" message shown

---

## 🔍 **CONSOLE LOGGING**

### **New Log Messages**

```
[UseAssetGenerator] Starting generation with .env API key
[Output Options] Image Prompt: true, Video Prompt: true, Caption: true, Actual Image: true (2 variations)
[Generating] Image Prompt: true, Video Prompt: true, Caption: true
[Validating] jsonImagePrompt...
✓ jsonImagePrompt is valid JSON
[Validating] jsonVideoPrompt...
✓ jsonVideoPrompt is valid JSON
[Skipping] Image generation (not requested by user)  // If unchecked
```

---

## ⚡ **PERFORMANCE IMPACT**

### **Build Stats**

**Before Output Options:**
- Bundle: 365 KB (gzipped: 97.78 KB)
- Build time: 427ms

**After Output Options:**
- Bundle: 370.52 KB (gzipped: 98.96 KB)
- Build time: 436ms
- **Impact:** +5 KB (+1.4%), negligible

### **Runtime Performance**

- **No options selected:** Generate button disabled (prevents wasteful API calls)
- **Skipping image gen:** Saves 8-16 seconds (no delay + image generation time)
- **1 image vs 2:** Saves ~10 seconds (1 delay cycle + 1 image generation)

---

## 🧪 **TESTING SCENARIOS**

### **Scenario 1: All Options Enabled (Default)**
1. All checkboxes checked
2. Number of images: 2
3. Click Generate
4. **Result:** Full generation (same as before)

### **Scenario 2: JSON Prompts Only**
1. Uncheck "Generate Actual Image"
2. Leave others checked
3. Click Generate
4. **Result:**
   - jsonImagePrompt generated & validated
   - jsonVideoPrompt generated & validated
   - Caption generated
   - No images generated
   - Console shows "[Skipping] Image generation"

### **Scenario 3: Single Image**
1. All checkboxes checked
2. Number of images: 1
3. Click Generate
4. **Result:**
   - All prompts generated
   - Only 1 image generated
   - Faster completion (~10s saved)

### **Scenario 4: Caption Only**
1. Uncheck all except "Generate Caption"
2. Click Generate
3. **Result:**
   - Only caption generated
   - jsonImagePrompt: `""`
   - jsonVideoPrompt: `""`
   - No images

### **Scenario 5: Nothing Selected**
1. Uncheck all options
2. Generate button becomes **disabled**
3. Cannot click
4. **Reason:** Prevents wasteful API call with no output

---

## 🐛 **ERROR HANDLING**

### **JSON Validation Failure**

If generated JSON is invalid:

```
[JSON Validation Failed] jsonImagePrompt: SyntaxError: Unexpected token...
[Invalid JSON String]: {visual_style: {...}  // Missing quotes!
Error: Generated jsonImagePrompt is not valid JSON. Please regenerate.
```

**User sees:** Error message asking to regenerate

### **No Options Selected**

Button disabled with visual feedback (grayed out)

---

## 📖 **USER GUIDE**

### **How to Use**

1. **Select your mode** (AUTO/MANUAL/JSON)
2. **Choose aspect ratio** (9:16, 16:9, etc.)
3. **Select what you want to generate:**
   - Need prompts only? Uncheck "Generate Actual Image"
   - Need just 1 image? Select "1 Image" from dropdown
   - Need only caption? Check only "Generate Caption"
4. **Click Generate Asset**
5. **View output** - Only selected items appear

### **Tips for Saving API Costs**

- **Prompt refinement:** Generate JSON prompts first (no images), review them, then generate images separately
- **Single variation:** Use "1 Image" when you don't need variations
- **Caption testing:** Generate only captions to test quote/author combinations

---

## 🔄 **BACKWARD COMPATIBILITY**

✅ **Fully backward compatible**

- Default state: All options enabled (same as before)
- Existing code works unchanged
- No breaking changes to API
- SavedAssets still work (all fields optional)

---

## 📚 **CODE REFERENCES**

### **Files Modified**

1. **hooks/useAssetGenerator.ts** (Lines 14-19, 58-105)
   - Added output options state
   - Updated generateAsset to pass options

2. **components/ControlsPanel.tsx** (Lines 14-29, 95-159)
   - Added output options UI
   - Checkboxes and dropdown

3. **components/OutputPanel.tsx** (Lines 118-146)
   - Conditional rendering

4. **services/generationPipeline.ts** (Lines 7-13, 24-89)
   - Added OutputOptions interface
   - JSON validation method
   - Conditional image generation

5. **services/gemini.ts** (Lines 74-99)
   - Updated to accept options
   - Pass to prompts

6. **prompts.ts** (Lines 195-211, 249-361)
   - Added JSON validation rules
   - Conditional prompt generation instructions

7. **App.tsx** (Lines 76-80)
   - Pass options to ControlsPanel

---

## ✅ **VERIFICATION CHECKLIST**

Before deploying:

- [x] Build successful
- [x] All options selectable/deselectable
- [x] Dropdown for number of images works
- [x] Generate button disables when nothing selected
- [x] JSON validation logs appear in console
- [x] Only selected outputs appear in UI
- [x] Empty sections hidden properly
- [x] Error messages clear when JSON invalid
- [x] Image generation skips when unchecked
- [x] 1 image option generates only 1 variation

---

## 🎉 **SUMMARY**

**New Capabilities:**
1. ✅ Selective output generation
2. ✅ 1 or 2 image variations
3. ✅ Automatic JSON validation
4. ✅ Clear error messages
5. ✅ Cost savings (skip unused outputs)
6. ✅ Conditional UI display

**Benefits:**
- 💰 Reduced API costs (generate only what you need)
- ⚡ Faster generation (skip image gen if not needed)
- 🎯 Better UX (control over outputs)
- 🔒 Validation (ensures valid JSON)
- 📊 Transparency (console logs show validation)

**Build:** ✅ 370.52 KB (98.96 KB gzipped)
**Status:** ✅ READY FOR TESTING

