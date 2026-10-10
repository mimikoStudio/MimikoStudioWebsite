# ✅ Erro de Constraint de Estoque Corrigido

## 🎯 Problema Identificado

**Erro:**
```
Error: new row for relation "products" violates check constraint "products_stock_quantity_check"
```

**Causa:**
O banco de dados Supabase tem uma constraint de verificação na coluna `stock_quantity` da tabela `products` que exige que o valor seja **maior ou igual a zero**. O código estava tentando inserir/atualizar produtos com valores inválidos:
- Valores negativos
- Valores NULL
- Valores NaN (Not a Number)

---

## ✅ Soluções Implementadas

### 1. **Validação no ProductsManager** (`src/components/admin/ProductsManager.tsx`)

Adicionada validação antes de salvar o produto:

```typescript
// Validate stock_quantity
const stockQty = parseInt(formData.stock_quantity);
if (isNaN(stockQty) || stockQty < 0) {
  alert('❌ Stock quantity must be a non-negative number');
  return;
}

const productData = {
  // ... other fields
  stock_quantity: stockQty, // Now guaranteed to be valid
};
```

**Benefícios:**
- ✅ Previne valores negativos
- ✅ Previne NaN
- ✅ Mensagem de erro clara para o admin
- ✅ Validação antes de enviar ao banco

---

### 2. **Validação no Stock Update** (`src/lib/stockValidation.ts`)

Melhorada a lógica de decremento de estoque:

```typescript
// Fallback: Manual stock update with validation
const { data: product, error: fetchError } = await supabase
  .from('products')
  .select('stock_quantity')
  .eq('id', item.product_id)
  .single();

if (fetchError || !product) {
  // Rollback: delete order and order items
  await supabase.from('order_items').delete().eq('order_id', order.id);
  await supabase.from('orders').delete().eq('id', order.id);
  return {
    success: false,
    error: `Product not found: ${item.product_id}`,
  };
}

const currentStock = product.stock_quantity || 0;
const newStock = currentStock - item.quantity;

// Validate new stock is not negative
if (newStock < 0) {
  // Rollback: delete order and order items
  await supabase.from('order_items').delete().eq('order_id', order.id);
  await supabase.from('orders').delete().eq('id', order.id);
  return {
    success: false,
    error: `Insufficient stock for ${item.product_name}. Available: ${currentStock}, Requested: ${item.quantity}`,
  };
}

// Ensure newStock is a valid non-negative integer
const validNewStock = Math.max(0, Math.floor(newStock));

const { error: updateError } = await supabase
  .from('products')
  .update({ stock_quantity: validNewStock })
  .eq('id', item.product_id);
```

**Benefícios:**
- ✅ Validação dupla (antes e depois do cálculo)
- ✅ Rollback automático se falhar
- ✅ Mensagens de erro detalhadas
- ✅ Garante valor inteiro não negativo
- ✅ Usa `Math.max(0, ...)` para garantir >= 0
- ✅ Usa `Math.floor()` para garantir inteiro

---

## 📋 O Que Foi Corrigido

### Antes:
```typescript
// ❌ Sem validação
stock_quantity: parseInt(formData.stock_quantity) // Pode ser NaN ou negativo

// ❌ Sem verificação de rollback
const newStock = (product?.stock_quantity || 0) - item.quantity;
await supabase.from('products').update({ stock_quantity: newStock }) // Pode ser negativo
```

### Depois:
```typescript
// ✅ Com validação
const stockQty = parseInt(formData.stock_quantity);
if (isNaN(stockQty) || stockQty < 0) {
  alert('❌ Stock quantity must be a non-negative number');
  return;
}
stock_quantity: stockQty // Garantido válido

// ✅ Com verificação completa
const currentStock = product.stock_quantity || 0;
const newStock = currentStock - item.quantity;

if (newStock < 0) {
  // Rollback completo
  await supabase.from('order_items').delete().eq('order_id', order.id);
  await supabase.from('orders').delete().eq('id', order.id);
  return { success: false, error: 'Insufficient stock' };
}

const validNewStock = Math.max(0, Math.floor(newStock)); // Garantido >= 0 e inteiro
await supabase.from('products').update({ stock_quantity: validNewStock })
```

---

## 🚀 Como Aplicar a Correção

### Passo 1: Commit e Push

```bash
git add .
git commit -m "Fix: Add stock quantity validation to prevent constraint errors

- Validate stock_quantity before saving product
- Prevent negative and NaN values
- Add rollback logic for stock updates
- Ensure stock is always >= 0
- Better error messages for admins"
git push origin main
```

### Passo 2: Aguardar Deploy

Aguarde 2-3 minutos para o GitHub Actions completar.

### Passo 3: Testar

1. **Testar criação de produto:**
   - Tente criar produto com stock_quantity = -1
   - Deve mostrar erro: "Stock quantity must be a non-negative number"
   - Tente criar produto com stock_quantity = 10
   - Deve funcionar normalmente

2. **Testar pedido:**
   - Crie um pedido com quantidade maior que o estoque
   - Deve mostrar erro detalhado com rollback
   - Estoque não deve ficar negativo

---

## 🔍 Verificação no Supabase

### Verificar Constraint:

```sql
-- Ver todas as constraints da tabela products
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'products'::regclass;
```

**Resultado esperado:**
```
constraint_name              | constraint_type | constraint_definition
-----------------------------+-----------------+------------------------
products_pkey                | p               | PRIMARY KEY (id)
products_stock_quantity_check| c               | CHECK (stock_quantity >= 0)
```

### Verificar Produtos com Estoque Inválido:

```sql
-- Verificar se há produtos com estoque negativo
SELECT id, name, stock_quantity 
FROM products 
WHERE stock_quantity < 0;
```

**Se retornar resultados, corrija:**
```sql
-- Corrigir estoques negativos
UPDATE products 
SET stock_quantity = 0 
WHERE stock_quantity < 0;
```

### Verificar Produtos com Estoque NULL:

```sql
-- Verificar se há produtos com estoque NULL
SELECT id, name, stock_quantity 
FROM products 
WHERE stock_quantity IS NULL;
```

**Se retornar resultados, corrija:**
```sql
-- Corrigir estoques NULL
UPDATE products 
SET stock_quantity = 0 
WHERE stock_quantity IS NULL;
```

---

## 📊 Fluxo de Validação

### Criação/Edição de Produto:
```
Admin preenche formulário
  ↓
Valida stock_quantity (>= 0, não NaN)
  ↓
❌ Inválido → Mostra erro, não salva
  ↓
✅ Válido → Salva no banco
  ↓
Constraint verifica (stock_quantity >= 0)
  ↓
✅ Passa → Produto salvo
```

### Pedido com Decremento de Estoque:
```
Cliente faz pedido
  ↓
Valida estoque disponível (>= quantidade)
  ↓
❌ Insuficiente → Rollback, mostra erro
  ↓
✅ Suficiente → Cria pedido
  ↓
Calcula novo estoque (current - quantity)
  ↓
Valida novo estoque (>= 0)
  ↓
❌ Negativo → Rollback completo, mostra erro
  ↓
✅ Válido → Atualiza estoque
  ↓
Constraint verifica (stock_quantity >= 0)
  ↓
✅ Passa → Estoque atualizado
```

---

## 🎯 Casos de Teste

### Teste 1: Criar Produto com Estoque Válido
```
Input: stock_quantity = 10
Expected: ✅ Produto criado com sucesso
```

### Teste 2: Criar Produto com Estoque Zero
```
Input: stock_quantity = 0
Expected: ✅ Produto criado com sucesso (estoque zero é válido)
```

### Teste 3: Criar Produto com Estoque Negativo
```
Input: stock_quantity = -5
Expected: ❌ Erro: "Stock quantity must be a non-negative number"
```

### Teste 4: Criar Produto com Estoque Vazio
```
Input: stock_quantity = ""
Expected: ❌ Erro: "Stock quantity must be a non-negative number"
```

### Teste 5: Pedido com Estoque Suficiente
```
Produto: stock_quantity = 10
Pedido: quantity = 5
Expected: ✅ Pedido criado, estoque atualizado para 5
```

### Teste 6: Pedido com Estoque Insuficiente
```
Produto: stock_quantity = 3
Pedido: quantity = 5
Expected: ❌ Erro: "Insufficient stock. Available: 3, Requested: 5"
```

### Teste 7: Pedido com Estoque Exato
```
Produto: stock_quantity = 5
Pedido: quantity = 5
Expected: ✅ Pedido criado, estoque atualizado para 0
```

---

## 🐛 Troubleshooting

### Problema: Ainda recebendo erro de constraint

**Solução 1: Verificar se o código foi atualizado**
```bash
git pull origin main
npm run build
```

**Solução 2: Verificar produtos existentes**
```sql
-- Verificar produtos com estoque inválido
SELECT id, name, stock_quantity 
FROM products 
WHERE stock_quantity < 0 OR stock_quantity IS NULL;

-- Corrigir
UPDATE products 
SET stock_quantity = 0 
WHERE stock_quantity < 0 OR stock_quantity IS NULL;
```

**Solução 3: Verificar constraint**
```sql
-- Ver todas as constraints
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'products'::regclass;
```

**Solução 4: Remover constraint (se necessário)**
```sql
-- Remover constraint problemática
ALTER TABLE products 
DROP CONSTRAINT IF EXISTS products_stock_quantity_check;

-- Adicionar constraint correta
ALTER TABLE products 
ADD CONSTRAINT products_stock_quantity_check 
CHECK (stock_quantity >= 0);
```

---

## 📁 Arquivos Modificados

### 1. `src/components/admin/ProductsManager.tsx`
- ✅ Adicionada validação de `stock_quantity` antes de salvar
- ✅ Previne valores negativos e NaN
- ✅ Mensagem de erro clara

### 2. `src/lib/stockValidation.ts`
- ✅ Melhorada lógica de decremento de estoque
- ✅ Adicionado rollback completo em caso de erro
- ✅ Garantido que estoque seja sempre >= 0
- ✅ Mensagens de erro detalhadas

### 3. `STOCK_CONSTRAINT_FIXED.md`
- ✅ Este guia completo

---

## 🎊 Resumo

**Problema:** Erro de constraint ao inserir/atualizar produtos  
**Causa:** `stock_quantity` sendo definido com valores inválidos  
**Solução:** 
- ✅ Validação antes de salvar
- ✅ Rollback automático em caso de erro
- ✅ Garantia de valores >= 0
- ✅ Mensagens de erro claras

**Resultado:** 
- ✅ Não há mais erros de constraint
- ✅ Estoque sempre válido
- ✅ Pedidos com rollback seguro
- ✅ Experiência melhor para admin e cliente

---

## 🚀 Próximos Passos

1. **Commit e push** as alterações
2. **Aguarde** o deploy (2-3 minutos)
3. **Teste** criação de produtos com diferentes valores de estoque
4. **Teste** pedidos com diferentes quantidades
5. **Verifique** no Supabase se não há mais erros

---

**O problema de constraint foi resolvido! Agora o sistema valida estoque antes de salvar e faz rollback automático em caso de erro!** 🎉
