export type ConditionalOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'greater_equal'
  | 'less_equal'
  | 'is_empty'
  | 'is_not_empty'
  | 'starts_with'
  | 'ends_with';

export type ConditionalAction = 'show' | 'hide' | 'require' | 'skip_to_page';

export type ConditionalLogicType = 'and' | 'or';

export interface Condition {
  id: string;
  field_id: string;
  operator: ConditionalOperator;
  value: string | number | boolean | string[];
}

export interface ConditionalLogic {
  conditions: Condition[];
  logic: ConditionalLogicType;
  action: ConditionalAction;
  target_page_id?: string; // for skip_to_page action
}
