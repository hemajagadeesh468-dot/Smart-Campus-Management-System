package campusiq.faculty;

import java.util.*;

public final class Json {
    private Json() {}
    public static Object parse(String text) {
        if (text == null || text.isBlank()) return new LinkedHashMap<String,Object>();
        return new Parser(text).parse();
    }
    public static String stringify(Object value) {
        if(value==null) return "null";
        if(value instanceof String s) return "\""+escape(s)+"\"";
        if(value instanceof Number || value instanceof Boolean) return value.toString();
        if(value instanceof Map<?,?> map){
            StringJoiner j=new StringJoiner(",","{","}");
            map.forEach((k,v)->j.add(stringify(String.valueOf(k))+":"+stringify(v)));
            return j.toString();
        }
        if(value instanceof Iterable<?> it){
            StringJoiner j=new StringJoiner(",","[","]"); for(Object x:it)j.add(stringify(x)); return j.toString();
        }
        return stringify(value.toString());
    }
    private static String escape(String s){return s.replace("\\","\\\\").replace("\"","\\\"").replace("\n","\\n").replace("\r","\\r").replace("\t","\\t");}
    private static final class Parser {
        final String s; int i=0; Parser(String s){this.s=s;}
        Object parse(){Object v=value(); ws(); return v;}
        void ws(){while(i<s.length()&&Character.isWhitespace(s.charAt(i)))i++;}
        Object value(){
            ws(); if(i>=s.length())return null; char c=s.charAt(i);
            if(c=='{')return object(); if(c=='[')return array(); if(c=='"')return string();
            if(s.startsWith("true",i)){i+=4;return true;} if(s.startsWith("false",i)){i+=5;return false;} if(s.startsWith("null",i)){i+=4;return null;}
            int st=i; while(i<s.length()&&"-+0123456789.eE".indexOf(s.charAt(i))>=0)i++;
            if(st==i)throw new IllegalArgumentException("Invalid JSON at "+i);
            String n=s.substring(st,i); try{return n.contains(".")?Double.valueOf(n):Long.valueOf(n);}catch(Exception e){return 0;}
        }
        Map<String,Object> object(){
            Map<String,Object> m=new LinkedHashMap<>(); i++; ws(); if(i<s.length()&&s.charAt(i)=='}'){i++;return m;}
            while(i<s.length()){ws();String k=string();ws();if(s.charAt(i++)!=':')throw new IllegalArgumentException("Expected colon");m.put(k,value());ws();char c=s.charAt(i++);if(c=='}')return m;if(c!=',')throw new IllegalArgumentException("Expected comma");}
            throw new IllegalArgumentException("Unclosed object");
        }
        List<Object> array(){List<Object>a=new ArrayList<>();i++;ws();if(i<s.length()&&s.charAt(i)==']'){i++;return a;}while(i<s.length()){a.add(value());ws();char c=s.charAt(i++);if(c==']')return a;if(c!=',')throw new IllegalArgumentException("Expected comma");}throw new IllegalArgumentException("Unclosed array");}
        String string(){if(s.charAt(i++)!='"')throw new IllegalArgumentException("Expected string");StringBuilder b=new StringBuilder();while(i<s.length()){char c=s.charAt(i++);if(c=='"')return b.toString();if(c=='\\'&&i<s.length()){char e=s.charAt(i++);switch(e){case 'n'->b.append('\n');case 'r'->b.append('\r');case 't'->b.append('\t');default->b.append(e);}}else b.append(c);}throw new IllegalArgumentException("Unclosed string");}
    }
}
