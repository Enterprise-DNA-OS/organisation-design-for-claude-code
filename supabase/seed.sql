insert into scenarios(id,code,name,owner,purpose,source_as_of,review_on,retention_review_on) values
 ('10000000-0000-4000-8000-000000000001','CURRENT','Kauri current structure','Operations lead','Quarterly capacity review',current_date-120,current_date-5,current_date-1),
 ('10000000-0000-4000-8000-000000000002','OPTION-A','Kauri shared services option','Finance lead','Compare departmental capacity',current_date-10,current_date+14,current_date+180)
 on conflict(code) do nothing;
update scenarios set baseline_id='10000000-0000-4000-8000-000000000001' where code='OPTION-A' and baseline_id is null;
insert into positions(scenario_id,code,title,department,parent_code,fte,annual_rate,currency,occupancy) values
 ('10000000-0000-4000-8000-000000000001','P01','General manager','Leadership',null,1,180000,'NZD','filled'),
 ('10000000-0000-4000-8000-000000000001','P02','Delivery lead','Delivery','P01',1,130000,'NZD','filled'),
 ('10000000-0000-4000-8000-000000000001','P03','Service analyst','Delivery','P02',0.8,95000,'NZD','filled'),
 ('10000000-0000-4000-8000-000000000001','P04','Service analyst','Delivery','P02',1,95000,'NZD','vacant'),
 ('10000000-0000-4000-8000-000000000001','P05','Accounts coordinator','Finance','P01',0.6,85000,'NZD','filled'),
 ('10000000-0000-4000-8000-000000000001','P06','Regional coordinator','Australia','P01',1,90000,'AUD','filled'),
 ('10000000-0000-4000-8000-000000000002','P01','General manager','Leadership',null,1,180000,'NZD','filled'),
 ('10000000-0000-4000-8000-000000000002','P02','Delivery lead','Delivery','P01',1,130000,'NZD','filled'),
 ('10000000-0000-4000-8000-000000000002','P03','Service analyst','Shared services','P01',0.8,95000,'NZD','filled'),
 ('10000000-0000-4000-8000-000000000002','P04','Service analyst','Shared services','P01',0.5,95000,'NZD','vacant'),
 ('10000000-0000-4000-8000-000000000002','P05','Accounts coordinator','Shared services','P01',0.6,85000,'NZD','filled'),
 ('10000000-0000-4000-8000-000000000002','P06','Regional coordinator','Australia','P01',1,90000,'AUD','filled')
 on conflict(scenario_id,code) do nothing;
insert into actions(code,scenario_id,title,owner,due_on) values
 ('REV-01','10000000-0000-4000-8000-000000000001','Confirm cost-rate assumptions','Finance lead',current_date-7),
 ('REV-02','10000000-0000-4000-8000-000000000002','Review service coverage in shared option','Operations lead',current_date+4)
 on conflict(code) do nothing;

update scenarios set baseline_snapshot=(select jsonb_agg(to_jsonb(p)) from positions p where p.scenario_id='10000000-0000-4000-8000-000000000001') where code='OPTION-A' and baseline_snapshot is null;
