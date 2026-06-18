# Item Transfer - Quick Reference Guide

## What Was Fixed
**Issue:** Item Transfer records were saved but didn't update inventory quantities.  
**Solution:** Added automatic inventory sync based on the remark type.

---

## How It Works Now

### When User Selects "RETURNED"
```
Item Transfer Form:
├─ Item Name: "Arduino Board"
├─ Quantity: 5
├─ Remark: RETURNED ← User selects this
└─ Date: 2026-06-18

Result:
→ Record saved to history ✓
→ Arduino Board quantity DECREASES by 5 ✓
→ Activity logged ✓
```

### When User Selects "RELEASED"
```
Item Transfer Form:
├─ Item Name: "Arduino Board"
├─ Quantity: 5
├─ Remark: RELEASED ← User selects this
└─ Date: 2026-06-18

Result:
→ Record saved to history ✓
→ Arduino Board quantity INCREASES by 5 ✓
→ Activity logged ✓
```

---

## Technical Details

### API Endpoints Added

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/product/decrease-quantity` | POST | Decrease inventory (RETURNED) |
| `/api/product/increase-quantity` | POST | Increase inventory (RELEASED) |

### What Happens Behind the Scenes

1. **Form Submission**
   - User fills item details and selects remark
   - Form validates all fields

2. **Record Save**
   - Record saved to localStorage immediately
   - Entry added to transfer history

3. **Inventory Update**
   - Check remark type
   - If RETURNED: Call decrease-quantity API
   - If RELEASED: Call increase-quantity API
   - API updates database (product_in or stock table)

4. **Error Handling**
   - If API fails: Record is already saved (no data loss)
   - Error is logged to console (doesn't block user)
   - User sees success message regardless

5. **Activity Logging**
   - Records user, timestamp, action
   - Now includes remark type in details

---

## Examples

### Example 1: Return Components
```
User at Item Transfer page:
1. Fills:
   - Item Name: "LED Light"
   - Quantity: 10
   - Type: STOCK
   - Category: Component
   - Remark: RETURNED
   
2. Clicks "Add Item"

Result:
✓ Transfer record created
✓ LED Light inventory: 100 → 90 (decreased by 10)
✓ Activity log: "Transferred 10x LED Light (RETURNED)"
```

### Example 2: Release Products
```
User at Item Transfer page:
1. Fills:
   - Item Name: "Arduino Kit"
   - Quantity: 3
   - Type: PRODUCT
   - Category: Product
   - Remark: RELEASED

2. Clicks "Add Item"

Result:
✓ Transfer record created
✓ Arduino Kit inventory: 50 → 53 (increased by 3)
✓ Activity log: "Transferred 3x Arduino Kit (RELEASED)"
```

### Example 3: Bulk Transfer with Mixed Remarks
```
Multiple Item Input:
1. Row 1: LED Light, 5x, RETURNED
2. Row 2: Arduino Board, 2x, RELEASED
3. Row 3: Resistor Pack, 20x, RETURNED

Result:
✓ All 3 records created
✓ LED Light: decreased by 5
✓ Arduino Board: increased by 2
✓ Resistor Pack: decreased by 20
✓ All activity logged
```

---

## Troubleshooting

### "Inventory update failed" appears
- **What it means:** API call failed, but record was still saved
- **What to do:** Check that item exists in inventory with correct spelling/category
- **Recovery:** Item Transfer record is safe; manual inventory adjustment may be needed

### Quantity didn't change in inventory
- **Possible causes:**
  - Item doesn't exist in inventory
  - Wrong category selected
  - Wrong type (PRODUCT vs STOCK)
- **Fix:** Edit the transfer record and update the details

### Bulk operation partially failed
- **What happens:** Each row is processed independently
- **Result:** Some rows update, others fail
- **Action:** Review each row's result in console; retry failed items individually

---

## Admin Features

- **Edit records:** Click edit icon, modify details, save
- **Delete records:** Admins only; click delete icon (confirmation required)
- **View history:** All transfers recorded with timestamp and user info
- **Filter:** By month, search by item name, purpose, or receiver

---

## Files Changed
- ✏️ Modified: `app/view/item-transfer/page.jsx`
- ✨ Created: `app/api/product/decrease-quantity/route.js`
- ✨ Created: `app/api/product/increase-quantity/route.js`

---

## Commit Info
**Hash:** `830632e`  
**Message:** "Fix Item Transfer Return/Release quantity sync"  
**Date:** 2026-06-18
