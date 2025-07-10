"use strict";(()=>{var e={};e.id=243,e.ids=[243],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},4300:e=>{e.exports=require("buffer")},6113:e=>{e.exports=require("crypto")},2781:e=>{e.exports=require("stream")},3837:e=>{e.exports=require("util")},7523:(e,t,i)=>{i.r(t),i.d(t,{originalPathname:()=>v,patchFetch:()=>R,requestAsyncStorage:()=>_,routeModule:()=>l,serverHooks:()=>m,staticGenerationAsyncStorage:()=>$});var r={};i.r(r),i.d(r,{GET:()=>d,POST:()=>p});var n=i(9303),a=i(8716),o=i(670),s=i(7070),u=i(8784),c=i(5456);async function d(e){try{let t=await (0,c.R)(e);if(!t)return s.NextResponse.json({message:"Unauthorized"},{status:401});let i=await u.Z.query(`SELECT 
        i.*,
        c.name as contact_name,
        c.email as contact_email,
        COALESCE(SUM(p.amount), 0) as amount_paid,
        i.total - COALESCE(SUM(p.amount), 0) as amount_due
      FROM invoices i
      LEFT JOIN contacts c ON i.contact_id = c.id
      LEFT JOIN payment_allocations pa ON pa.invoice_id = i.id
      LEFT JOIN payments p ON p.id = pa.payment_id
      WHERE i.organization_id = $1
      GROUP BY i.id, c.name, c.email
      ORDER BY i.invoice_date DESC`,[t.organizationId]);return s.NextResponse.json(i.rows)}catch(e){return console.error("Get invoices error:",e),s.NextResponse.json({message:"Internal server error"},{status:500})}}async function p(e){try{let t=await (0,c.R)(e);if(!t)return s.NextResponse.json({message:"Unauthorized"},{status:401});let{contactId:i,invoiceNumber:r,issueDate:n,dueDate:a,items:o,notes:d,terms:p}=await e.json();await u.Z.query("BEGIN");let l=0,_=0;o.forEach(e=>{let t=e.quantity*e.unitPrice,i=t*(e.taxRate||0)/100;l+=t,_+=i});let $=l+_,m=(await u.Z.query(`INSERT INTO invoices (
        organization_id, contact_id, invoice_number, invoice_date, due_date,
        subtotal, tax_total, total, status, notes, terms
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,[t.organizationId,i,r,n,a,l,_,$,"draft",d,p])).rows[0];for(let e of o){let t=e.quantity*e.unitPrice,i=t*(e.taxRate||0)/100;await u.Z.query(`INSERT INTO invoice_line_items (
          invoice_id, item_id, description, quantity, unit_price,
          discount_percentage, tax_rate_id, line_total, tax_amount, total
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,[m.id,e.itemId||null,e.description,e.quantity,e.unitPrice,e.discount||0,e.taxRateId||null,t,i,t+i])}let v=(await u.Z.query(`INSERT INTO journal_entries (
        organization_id, transaction_date, description, reference_type, reference_id
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id`,[t.organizationId,n,`Invoice ${r}`,"invoice",m.id])).rows[0].id;return await u.Z.query(`INSERT INTO journal_entry_lines (
        journal_entry_id, account_id, debit, credit, description
      ) VALUES ($1, $2, $3, $4, $5)`,[v,1200,$,0,`Invoice ${r} - ${m.contact_name||"Customer"}`]),await u.Z.query(`INSERT INTO journal_entry_lines (
        journal_entry_id, account_id, debit, credit, description
      ) VALUES ($1, $2, $3, $4, $5)`,[v,4e3,0,l,`Revenue from Invoice ${r}`]),_>0&&await u.Z.query(`INSERT INTO journal_entry_lines (
          journal_entry_id, account_id, debit, credit, description
        ) VALUES ($1, $2, $3, $4, $5)`,[v,2200,0,_,`Sales tax for Invoice ${r}`]),await u.Z.query("COMMIT"),s.NextResponse.json(m,{status:201})}catch(e){return await u.Z.query("ROLLBACK"),console.error("Create invoice error:",e),s.NextResponse.json({message:"Internal server error"},{status:500})}}let l=new n.AppRouteRouteModule({definition:{kind:a.x.APP_ROUTE,page:"/api/invoices/route",pathname:"/api/invoices",filename:"route",bundlePath:"app/api/invoices/route"},resolvedPagePath:"/Users/user/Desktop/apps/amom/app/api/invoices/route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:_,staticGenerationAsyncStorage:$,serverHooks:m}=l,v="/api/invoices/route";function R(){return(0,o.patchFetch)({serverHooks:m,staticGenerationAsyncStorage:$})}},5456:(e,t,i)=>{i.d(t,{R:()=>a});var r=i(1482),n=i.n(r);async function a(e){try{let t=e.cookies.get("token")?.value;if(!t)return null;return n().verify(t,process.env.JWT_SECRET)}catch(e){return null}}},8784:(e,t,i)=>{i.d(t,{Z:()=>r});let r=new(require("pg")).Pool({host:process.env.DB_HOST,port:parseInt(process.env.DB_PORT||"5432"),database:process.env.DB_NAME,user:process.env.DB_USER,password:process.env.DB_PASSWORD,max:20,idleTimeoutMillis:3e4,connectionTimeoutMillis:2e3})}};var t=require("../../../webpack-runtime.js");t.C(e);var i=e=>t(t.s=e),r=t.X(0,[948,59,482],()=>i(7523));module.exports=r})();